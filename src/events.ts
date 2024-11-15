// eslint-disable-next-line import/no-extraneous-dependencies
import { getContractEventsParser } from "mercury-sdk";

import type { SoroswapContract } from "./types";
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

// Rule disabled because this shouldn't be an export; it just needs to be after
// the stuff it calls.
// eslint-disable-next-line import/no-unused-modules
export const doStringContractType = (
    contractType: string,
    subscriptions: readonly string[],
    promises: readonly Readonly<Promise<unknown>>[],
): { promises: Promise<unknown>[]; subscriptions: string[] } => {
    if (
        ["factory", "SoroswapFactory"].includes(contractType) &&
        !subscriptions.includes("factory")
    ) {
        return {
            promises: [...promises, getSoroswapFactoryEvents()],
            subscriptions: [...subscriptions, "factory"],
        };
    }

    if (["router", "SoroswapRouter"].includes(contractType) && !subscriptions.includes("router")) {
        return {
            promises: [...promises, getSoroswapRouterEvents()],
            subscriptions: [...subscriptions, "router"],
        };
    }

    throw new Error("Invalid contract type");
};

// Rule disabled because this shouldn't be an export; it just needs to be after
// the stuff it calls.
// eslint-disable-next-line import/no-unused-modules
export const eventFetcher = (
    {
        promises,
        subscriptions,
    }: Readonly<{
        promises: readonly Readonly<Promise<unknown>>[];
        subscriptions: readonly string[];
    }>,
    contractType: SoroswapContract,
): { promises: Promise<unknown>[]; subscriptions: string[] } => {
    switch (typeof contractType) {
        case "string": {
            return doStringContractType(contractType, subscriptions, promises);
        }
        case "object": {
            const pairsToFetchFrom = contractType.pair ?? contractType.SoroswapPair;

            return {
                promises: [...promises, getEventsFromSoroswapPairs(pairsToFetchFrom)],
                subscriptions: [...subscriptions, ...pairsToFetchFrom],
            };
        }

        default: {
            throw new Error("Invalid contract type");
        }
    }
};

/**
 * Retrieve events from Soroswap contracts of the given types.
 * @param contractTypes An array of types of contracts to subscribe to.
 * These can be:
 *  - the strings "SoroswapFactory" or "factory"
 *  - the strings "SoroswapRouter" or "router"
 *  - an object with either the key "SoroswapPair" or just "pair" and the value
 *    an array of contract IDs to subscribe to.
 * @returns {Promise<unknown>} A promise that resolves to the flat event array.
 * @throws {Error} If the events cannot be read.
 */
export const getEventsFromSoroswapContracts = async (
    contractTypes: readonly SoroswapContract[],
): Promise<unknown> => {
    const { promises: returnedPromises } = contractTypes.reduce(eventFetcher, {
        promises: [] as Promise<unknown>[],
        subscriptions: [] as string[],
    });

    const rawEvents = (await Promise.all(returnedPromises)) as unknown[][];

    return rawEvents.flat();
};
