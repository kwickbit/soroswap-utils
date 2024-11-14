// eslint-disable-next-line import/no-extraneous-dependencies
import { getContractEventsParser } from "mercury-sdk";

import { buildMercuryInstance, getEnvironmentVariable } from "./utils";

const fetchSoroswapEvents = async (
    contractId: string,
    isEnvironmentVariable = false,
): Promise<unknown> => {
    const mercuryInstance = buildMercuryInstance();

    const soroswapEvents = await mercuryInstance.getContractEvents({
        contractId: isEnvironmentVariable ? getEnvironmentVariable(contractId) : contractId,
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
    await fetchSoroswapEvents("SOROSWAP_FACTORY_CONTRACT", true);

/**
 * Retrieve Soroswap Router contract events.
 * @returns {Promise<unknown>} A promise that resolves to the event array.
 * @throws {Error} If the events cannot be read.
 */
export const getSoroswapRouterEvents = async (): Promise<unknown> =>
    await fetchSoroswapEvents("SOROSWAP_ROUTER_CONTRACT");

/**
 * Retrieve events from a given Soroswap Pair contract.
 * @param contractId The contract ID of the Soroswap Pair contract.
 * @returns {Promise<unknown>} A promise that resolves to the event array.
 * @throws {Error} If the events cannot be read.
 */
export const getSoroswapPairEvents = async (contractId: string): Promise<unknown> =>
    await fetchSoroswapEvents(contractId);
