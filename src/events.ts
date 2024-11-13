// eslint-disable-next-line import/no-extraneous-dependencies
import { getContractEventsParser } from "mercury-sdk";

import { buildMercuryInstance, getEnvironmentVariable } from "./utils";

const getSoroswapEvents = async (contract: string): Promise<unknown> => {
    const mercuryInstance = buildMercuryInstance();

    const soroswapEvents = await mercuryInstance.getContractEvents({
        contractId: getEnvironmentVariable(contract),
    });

    if (soroswapEvents.error !== undefined) {
        throw new Error(soroswapEvents.error);
    }

    if (soroswapEvents.data === null) {
        throw new Error("No events found");
    }

    return getContractEventsParser(soroswapEvents.data);
};

/**
 * Retrieve Soroswap Factory contract events.
 * @returns {Promise<unknown>} A promise that resolves to the event array.
 * @throws {Error} If the events cannot be read.
 */
export const getSoroswapFactoryEvents = async (): Promise<unknown> =>
    await getSoroswapEvents("SOROSWAP_FACTORY_CONTRACT");

/**
 * Retrieve Soroswap Router contract events.
 * @returns {Promise<unknown>} A promise that resolves to the event array.
 * @throws {Error} If the events cannot be read.
 */
export const getSoroswapRouterEvents = async (): Promise<unknown> =>
    await getSoroswapEvents("SOROSWAP_ROUTER_CONTRACT");
