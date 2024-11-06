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

const validateString = (value: unknown, errorMessage: string): string => {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(errorMessage);
    }

    return value;
};

const getEnvironmentVariable = (name: string): string => {
    const {
        env: { [name]: value },
    } = process;

    return validateString(value, `Missing required environment variable: ${name}`);
};

/**
 * Retrieves the total number of liquidity pools from the Soroswap Factory contract's
 * storage, returning the total number of pairs.
 *
 * @returns {Promise<number>} A promise that resolves to the total number of liquidity pools.
 * @throws {Error} If the contract data cannot be read.
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

    // Rule disabled because this property is not camelCased in the smart contract
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return (scValToNative(xdr.ScVal.scvMap(storage)) as { TotalPairs: number }).TotalPairs;
};

/**
 * Retrieves all liquidity pool addresses from the Soroswap Factory contract.
 * Since there is no function to do that directly, this function fetches the
 * addresses by iterating through all pairs using their index.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of liquidity pool addresses.
 */
export const getLiquidityPoolAddresses = async (): Promise<string[]> => {
    const server = new SorobanRpc.Server(getEnvironmentVariable("SOROBAN_RPC_SERVER"));
    const contract = new Contract(getEnvironmentVariable("SOROSWAP_FACTORY_CONTRACT"));
    const sourceKeypair = Keypair.fromSecret(getEnvironmentVariable("PRIVATE_KEY"));
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
    const liquidityPoolCount = await getLiquidityPoolCount();

    const transactionTimeout = 30;

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
    ).then((results) => results.filter((address) => address !== undefined));
};
