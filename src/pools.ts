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

import { getAssetData as readAssetData } from "./assets";
import type { Asset, PoolData } from "./types";
import { getEnvironmentVariable, validateString } from "./utils";

const transactionTimeout = 30;

const callContract = async <SomePoolData>(
    poolAddress: string,
    functionName: "get_reserves" | "k_last" | "token_0" | "token_1",
): Promise<SomePoolData> => {
    const contract = new Contract(poolAddress);
    const server = new SorobanRpc.Server(getEnvironmentVariable("SOROBAN_RPC_SERVER"));

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

const getAssetData = async (
    poolAddress: string,
    functionName: "token_0" | "token_1",
): Promise<Asset> => {
    const assetAddress = await callContract<string>(poolAddress, functionName);

    return await readAssetData(assetAddress);
};

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
 * @param poolAddress The address of the liquidity pool.
 * @returns A promise that resolves to the data about the liquidity pool.
 * @throws If any contract call fails or if asset data cannot be retrieved.
 */
export const getLiquidityPoolData = async (poolAddress: string): Promise<PoolData> => ({
    // We call Soroban functions on the contract to populate the pool data.
    // Then we try to get more detailed data about the tokens.
    constantProductOfReserves: await callContract<number>(poolAddress, "k_last"),
    firstToken: await getAssetData(poolAddress, "token_0"),
    poolContract: poolAddress,
    reserves: await callContract<[number, number]>(poolAddress, "get_reserves"),
    secondToken: await getAssetData(poolAddress, "token_1"),
});
