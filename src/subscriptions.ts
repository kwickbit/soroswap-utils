import { buildMercuryInstance, getEnvironmentVariable } from "./utils";

const soroswapSubscriber = async (environmentVariable: string): Promise<boolean> => {
    const mercuryInstance = buildMercuryInstance();

    const response = await mercuryInstance.subscribeToContractEvents({
        contractId: getEnvironmentVariable(environmentVariable),
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
    await soroswapSubscriber("SOROSWAP_FACTORY_CONTRACT");

/**
 * The Soroswap Router contract emits events when a swap is executed.
 * Use this function to subscribe to those events.
 * @returns {Promise<boolean>} A promise that resolves to true if the
 * subscription was successful.
 */
export const subscribeToSoroswapRouter = async (): Promise<boolean> =>
    await soroswapSubscriber("SOROSWAP_ROUTER_CONTRACT");
