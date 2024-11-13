import { buildMercuryInstance, getEnvironmentVariable } from "./utils";

const soroswapSubscriber = async (
    contractId: string,
    isEnvironmentVariable = false,
): Promise<boolean> => {
    const mercuryInstance = buildMercuryInstance();

    const response = await mercuryInstance.subscribeToContractEvents({
        contractId: isEnvironmentVariable ? getEnvironmentVariable(contractId) : contractId,
    });

    return response.data as boolean;
};

/**
 * The Soroswap Factory contract emits events when a new pool is created.
 * Use this function to subscribe to those events.
 * @returns {Promise<boolean>} A promise that resolves to true if the
 * subscription was successful.
 */
export const subscribeToSoroswapFactory = async (): Promise<boolean> =>
    await soroswapSubscriber("SOROSWAP_FACTORY_CONTRACT", true);

/**
 * The Soroswap Router contract emits events when a swap is executed.
 * Use this function to subscribe to those events.
 * @returns {Promise<boolean>} A promise that resolves to true if the
 * subscription was successful.
 */
export const subscribeToSoroswapRouter = async (): Promise<boolean> =>
    await soroswapSubscriber("SOROSWAP_ROUTER_CONTRACT", true);

/**
 * Soroswap Pair contracts emit events for operations such as adding or
 * removing liquidity, swapping, or skimming.
 * Use this function to subscribe to those events.
 * @returns {Promise<boolean>} A promise that resolves to true if the
 * subscription was successful.
 */
export const subscribeToSoroswapPair = async (pairContract: string): Promise<boolean> =>
    await soroswapSubscriber(pairContract);
