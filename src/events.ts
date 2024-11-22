// eslint-disable-next-line import/no-extraneous-dependencies
import { getContractEventsParser } from "mercury-sdk";

import { parseFactoryEvent } from "./event_parsers/factory";
import { parsePairEvent } from "./event_parsers/pair";
import type {
    ExtendedPairEvent,
    FactoryEvent,
    RawExtendedPairEvent,
    RawFactoryEvent,
    SoroswapContract,
} from "./types";
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
 * Retrieve Soroswap Factory contract events. They are returned in chronological
 * order.
 * @returns A promise that resolves to the event array.
 * @throws If the events cannot be read.
 */
export const getSoroswapFactoryEvents = async ({
    shouldReturnRawEvents = false,
}): Promise<readonly (FactoryEvent | RawFactoryEvent)[]> => {
    const rawEvents = (await fetchSoroswapEvents(
        "SOROSWAP_FACTORY_CONTRACT",
        true,
    )) as RawFactoryEvent[];

    // Notice that `reverse` mutates the array in place. `toReversed` would be
    // preferrable, but it is not supported everywhere.
    rawEvents.reverse();

    if (shouldReturnRawEvents) {
        return rawEvents;
    }

    return await Promise.all(rawEvents.map(parseFactoryEvent));
};

/**
 * Retrieve Soroswap Router contract events.
 * @returns A promise that resolves to the event array.
 * @throws If the events cannot be read.
 */
export const getSoroswapRouterEvents = async (): Promise<unknown> =>
    await fetchSoroswapEvents("SOROSWAP_ROUTER_CONTRACT", true);

/**
 * Retrieve events from a given Soroswap Pair contract.
 * @param contractId The contract ID of the Soroswap Pair contract.
 * @returns A promise that resolves to the event array,
 * tagged with its contract ID.
 * @throws If the events cannot be read.
 */
export const getSoroswapPairEvents = async (
    contractId: string,
    options?: { readonly shouldReturnRawEvents?: boolean },
): Promise<readonly (ExtendedPairEvent | RawExtendedPairEvent)[]> => {
    const rawEvents = (await fetchSoroswapEvents(contractId)) as RawExtendedPairEvent[];
    const rawEventsWithContractId = rawEvents.map((event) => ({ ...event, contractId }));

    return options?.shouldReturnRawEvents !== undefined && options.shouldReturnRawEvents
        ? rawEventsWithContractId
        : await Promise.all(rawEventsWithContractId.map(parsePairEvent));
};

/**
 * Retrieve events from multiple SoroswapPair
 * contracts.
 * @param contractIds An array of contract IDs to subscribe to.
 * @returns A promise that resolves to the flat event array.
 * @throws If the events cannot be read.
 */
export const getEventsFromSoroswapPairs = async (
    contractIds: readonly string[],
): Promise<ExtendedPairEvent[]> => {
    const rawEvents = (await Promise.all(
        contractIds.map(async (contractId) => await getSoroswapPairEvents(contractId)),
    )) as ExtendedPairEvent[][];

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
            promises: [...promises, getSoroswapFactoryEvents({ shouldReturnRawEvents: false })],
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
 * @returns A promise that resolves to the flat event array.
 * @throws If the events cannot be read.
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
