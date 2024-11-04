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

/**
 * Retrieves the total number of liquidity pools from the Soroswap Factory contract's
 * storage, returning the total number of pairs.
 *
 * @returns {Promise<number>} A promise that resolves to the total number of liquidity pools
 * @throws {Error} If the contract data cannot be read
 */
export const getLiquidityPoolCount = async (): Promise<number> => {
    const { val } = await new SorobanRpc.Server(process.env.SOROBAN_RPC_SERVER!).getContractData(
        process.env.SOROSWAP_FACTORY_CONTRACT!,
        xdr.ScVal.scvLedgerKeyContractInstance()
    );

    const storage = val.contractData().val().instance().storage();

    if (storage === null) {
        throw new Error("Could not read the contract data");
    }

    const storageData = scValToNative(xdr.ScVal.scvMap(storage));
    return storageData.TotalPairs;
};

/**
 * Retrieves all liquidity pool addresses from the Soroswap Factory contract.
 * Since there is no function to do that directly, this function fetches the
 * addresses by iterating through all pairs using their index.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of liquidity pool addresses
 */
export const getLiquidityPoolAddresses = async () => {
    const server = new SorobanRpc.Server(process.env.SOROBAN_RPC_SERVER!);
    const contract = new Contract(process.env.SOROSWAP_FACTORY_CONTRACT!);
    const sourceKeypair = Keypair.fromSecret(process.env.PRIVATE_KEY!);
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
    const liquidityPoolCount = await getLiquidityPoolCount();

    // Fetch one liquidity pool address
    const fetchLiquidityPoolAddress = async (index: number) => {
        const rawTransaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(contract.call("all_pairs", nativeToScVal(index, { type: "u32" })))
            .setTimeout(30)
            .build();

        const getLiquidityPoolAddress = await server._simulateTransaction(rawTransaction);

        if (getLiquidityPoolAddress && getLiquidityPoolAddress.results) {
            const address = xdr.ScVal.fromXDR(getLiquidityPoolAddress.results[0].xdr, "base64");
            return Address.fromScVal(address).toString();
        }

        return null;
    };

    // Fetch all addresses
    return await Promise.all(
        Array.from({ length: liquidityPoolCount }, (_, index) => fetchLiquidityPoolAddress(index))
    ).then((results) => results.filter((address) => address !== null));
};
