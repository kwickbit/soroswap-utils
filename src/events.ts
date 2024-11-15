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
    await fetchSoroswapEvents("SOROSWAP_ROUTER_CONTRACT", true);

/**
 * Retrieve events from a given Soroswap Pair contract.
 * @param contractId The contract ID of the Soroswap Pair contract.
 * @returns {Promise<unknown>} A promise that resolves to the event array,
 * tagged with its contract ID.
 * @throws {Error} If the events cannot be read.
 */
export const getSoroswapPairEvents = async (contractId: string): Promise<unknown> => {
    const rawEvents = (await fetchSoroswapEvents(contractId)) as { [key: string]: unknown }[];

    return rawEvents.map((event) => ({ ...event, contractId }));
};

/**
 * Retrieve events from multiple SoroswapPair
 * contracts.
 * @param contractIds An array of contract IDs to subscribe to.
 * @returns {Promise<unknown>} A promise that resolves to the flat event array.
 * @throws {Error} If the events cannot be read.
 */
export const getEventsFromSoroswapPairs = async (
    contractIds: readonly string[],
): Promise<unknown> => {
    const rawEvents = (await Promise.all(
        contractIds.map(async (contractId) => await getSoroswapPairEvents(contractId)),
    )) as unknown[][];

    return rawEvents.flat();
};
