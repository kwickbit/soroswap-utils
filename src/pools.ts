import {
    Address,
    BASE_FEE,
    Contract,
    Keypair,
    nativeToScVal,
    Networks,
    scValToNative,
    SorobanRpc,
    TransactionBuilder,
    xdr,
} from "@stellar/stellar-sdk";

import { getAssetData } from "./assets";
import type { PoolData } from "./types";
import { getEnvironmentVariable, validateString } from "./utils";

interface CallContractParameters {
    readonly contract: Readonly<Contract>;
    readonly functionName: "get_reserves" | "k_last" | "token_0" | "token_1";
    readonly server: Readonly<SorobanRpc.Server>;
}

const transactionTimeout = 30;

const callContract = async <SomePoolData>({
    contract,
    functionName,
    server,
}: Readonly<CallContractParameters>): Promise<SomePoolData> => {
    // We always need to fetch the source account, to make sure we have the
    // latest sequence number.
    const publicKey = Keypair.fromSecret(getEnvironmentVariable("PRIVATE_KEY")).publicKey();
    const sourceAccount = await server.getAccount(publicKey);

    const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(contract.call(functionName))
        .setTimeout(transactionTimeout)
        .build();

    // Rule disabled because it refers to a dependency we cannot change.
    // eslint-disable-next-line no-underscore-dangle
    const result = await server._simulateTransaction(transaction);

    const firstResult = result.results?.[0];

    if (firstResult === undefined) {
        throw new Error("Calling the contract failed");
    }

    return scValToNative(xdr.ScVal.fromXDR(firstResult.xdr, "base64")) as SomePoolData;
};

const setVariables = (address: string) => ({
    baseArguments: {
        contract: new Contract(address),
        server: new SorobanRpc.Server(getEnvironmentVariable("SOROBAN_RPC_SERVER")),
    },

    poolData: { poolContract: address } as PoolData,

    testnetPlaceholderData: {
        domain: "placeholder domain",
        org: "placeholder org",
    },
});

/**
 * Retrieves the total number of liquidity pools from the Soroswap Factory
 * contract's storage, returning the total number of pairs.
 *
 * @returns A promise that resolves to the total number of liquidity pools.
 * @throws If the contract data cannot be read.
 */
export const getLiquidityPoolCount = async (): Promise<number> => {
    const { val: value } = await new SorobanRpc.Server(
        getEnvironmentVariable("SOROBAN_RPC_SERVER"),
    ).getContractData(
        getEnvironmentVariable("SOROSWAP_FACTORY_CONTRACT"),
        xdr.ScVal.scvLedgerKeyContractInstance(),
    );

    const storage = value.contractData().val().instance().storage();

    if (storage === null) {
        throw new Error("Could not read the contract data");
    }

    // Rule disabled because this property is not camelCased in
    // the smart contract
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return (scValToNative(xdr.ScVal.scvMap(storage)) as { TotalPairs: number }).TotalPairs;
};

/**
 * Retrieves all liquidity pool addresses from the Soroswap Factory contract.
 * Since there is no function to do that directly, this function fetches the
 * addresses by iterating through all pairs using their index.
 *
 * @returns A promise that resolves to an array of liquidity pool addresses.
 */
export const getLiquidityPoolAddresses = async (): Promise<string[]> => {
    const server = new SorobanRpc.Server(getEnvironmentVariable("SOROBAN_RPC_SERVER"));
    const contract = new Contract(getEnvironmentVariable("SOROSWAP_FACTORY_CONTRACT"));
    const sourceKeypair = Keypair.fromSecret(getEnvironmentVariable("PRIVATE_KEY"));
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
    const liquidityPoolCount = await getLiquidityPoolCount();

    // Fetch one liquidity pool address
    const fetchLiquidityPoolAddress = async (index: number) => {
        const rawTransaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(contract.call("all_pairs", nativeToScVal(index, { type: "u32" })))
            .setTimeout(transactionTimeout)
            .build();

        // Rule disabled because it refers to a dependency we cannot change.
        // eslint-disable-next-line no-underscore-dangle
        const getLiquidityPoolAddress = await server._simulateTransaction(rawTransaction);

        if (!getLiquidityPoolAddress.results) {
            return undefined;
        }

        const address = xdr.ScVal.fromXDR(
            validateString(
                getLiquidityPoolAddress.results[0]?.xdr,
                "Invalid response: missing pool address",
            ),
            "base64",
        );

        return Address.fromScVal(address).toString();
    };

    // Fetch all addresses
    return await Promise.all(
        Array.from(
            { length: liquidityPoolCount },
            // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
            async (_unused, index) => await fetchLiquidityPoolAddress(index),
        ),
    ).then((results) => results.filter((address): address is string => address !== undefined));
};

/**
 * Retrieves data about a liquidity pool.
 *
 * @param address The address of the liquidity pool.
 * @returns A promise that resolves to the data about the liquidity pool.
 * @throws If any contract call fails or if asset data cannot be retrieved.
 */
export const getLiquidityPoolData = async (address: string): Promise<PoolData> => {
    const { baseArguments, poolData, testnetPlaceholderData } = setVariables(address);

    // We call Soroban functions on the contract to populate the pool data.
    poolData.reserves = await callContract<[number, number]>({
        ...baseArguments,
        functionName: "get_reserves",
    });

    poolData.constantProductOfReserves = await callContract({
        ...baseArguments,
        functionName: "k_last",
    });

    const firstTokenAddress = await callContract<string>({
        ...baseArguments,
        functionName: "token_0",
    });

    // The functions only give us the addresses, which we use to fetch the
    // asset data.
    const firstTokenData = await getAssetData(firstTokenAddress);

    poolData.firstToken = firstTokenData
        ? { ...testnetPlaceholderData, ...firstTokenData }
        : firstTokenData;

    const secondTokenAddress = await callContract<string>({
        ...baseArguments,
        functionName: "token_1",
    });

    const secondTokenData = await getAssetData(secondTokenAddress);

    poolData.secondToken = secondTokenData
        ? { ...testnetPlaceholderData, ...secondTokenData }
        : secondTokenData;

    return poolData;
};
