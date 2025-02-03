import { getContractEventsParser } from "mercury-sdk";

import { getCachedOrFetch } from "./assets";
import { parseFactoryEvent } from "./event_parsers/factory";
import { parsePairEvent } from "./event_parsers/pair";
import { parseRouterEvent } from "./event_parsers/router";
import type {
    ExtendedPairEvent,
    FactoryEvent,
    RawExtendedPairEvent,
    RawFactoryEvent,
    RawRouterEvent,
    RawSoroswapEvent,
    RouterEvent,
    SoroswapContract,
    SoroswapEvent,
} from "./types";
import { buildMercuryInstance, resolveContractId } from "./utils";

interface EventGetterOptions {
    readonly shouldReturnRawEvents: boolean;
}

interface FetcherState {
    readonly options: EventGetterOptions;
    readonly promises: readonly Promise<readonly (SoroswapEvent | RawSoroswapEvent)[]>[];
    readonly subscriptions: readonly string[];
}

const fetchSoroswapEvents = async (
    contractId: string,
    isEnvironmentVariable = false,
): Promise<RawSoroswapEvent[]> => {
    const mercuryInstance = buildMercuryInstance();

    const resolvedContract = resolveContractId(contractId, isEnvironmentVariable);

    const soroswapEvents = await mercuryInstance.getContractEvents({
        contractId: resolvedContract,
    });

    if (soroswapEvents.error !== undefined) {
        throw new Error(soroswapEvents.error);
    }

    if (soroswapEvents.data === null) {
        throw new Error("No events found");
    }

    return getContractEventsParser(soroswapEvents.data) as unknown as RawSoroswapEvent[];
};

/**
 * Retrieve Soroswap Factory contract events. They are returned in chronological
 * order.
 * @param [options] Options for event retrieval
 * @param {boolean} [options.shouldReturnRawEvents] If true, return events in
 * a less structured format, closer to how they are returned by the chain.
 * @returns A promise that resolves to the event array.
 * @throws If the events cannot be read.
 */
const getSoroswapFactoryEvents = async (
    options?: EventGetterOptions,
): Promise<readonly (FactoryEvent | RawFactoryEvent)[]> => {
    const rawEvents = (await fetchSoroswapEvents(
        "SOROSWAP_FACTORY_CONTRACT",
        true,
    )) as RawFactoryEvent[];

    // Notice that `reverse` mutates the array in place. `toReversed` would be
    // preferrable, but it is not supported everywhere.
    rawEvents.reverse();

    if (options?.shouldReturnRawEvents !== undefined && options.shouldReturnRawEvents) {
        return rawEvents;
    }

    return await Promise.all(rawEvents.map(parseFactoryEvent));
};

/**
 * Retrieve events from Soroswap Router contracts.
 * @param [options] Options for event retrieval
 * @param {boolean} [options.shouldReturnRawEvents] If true, return events in
 * a less structured format, closer to how they are returned by the chain.
 * @returns A promise that resolves to the event array.
 * @throws If the events cannot be read.
 */
const getSoroswapRouterEvents = async (
    options?: EventGetterOptions,
): Promise<readonly (RouterEvent | RawRouterEvent)[]> => {
    const rawEvents = (await fetchSoroswapEvents(
        "SOROSWAP_ROUTER_CONTRACT",
        true,
    )) as RawRouterEvent[];

    if (options?.shouldReturnRawEvents !== undefined && options.shouldReturnRawEvents) {
        return rawEvents;
    }

    const assets = await getCachedOrFetch();

    return rawEvents.map((event) => parseRouterEvent(event, assets));
};

/**
 * Retrieve events from a given Soroswap Pair contract.
 * @param contractId The contract ID of the Soroswap Pair contract.
 * @param [options] Options for event retrieval
 * @param {boolean} [options.shouldReturnRawEvents] If true, return events in
 * a less structured format, closer to how they are returned by the chain.
 * @returns A promise that resolves to the event array,
 * tagged with its contract ID.
 * @throws If the events cannot be read.
 */
const getSoroswapPairEvents = async (
    contractId: string,
    options?: EventGetterOptions,
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
const getEventsFromSoroswapPairs = async (
    contractIds: readonly string[],
    options?: EventGetterOptions,
): Promise<ExtendedPairEvent[]> => {
    const rawEvents = (await Promise.all(
        contractIds.map(async (contractId) => await getSoroswapPairEvents(contractId, options)),
    )) as ExtendedPairEvent[][];

    return rawEvents.flat();
};

const doStringContractType = (
    contractType: string,
    promises: readonly Readonly<Promise<readonly (SoroswapEvent | RawSoroswapEvent)[]>>[],
    subscriptions: readonly string[],
    options: Readonly<EventGetterOptions>,
    // eslint-disable-next-line @typescript-eslint/max-params
): FetcherState => {
    if (
        ["factory", "SoroswapFactory"].includes(contractType) &&
        !subscriptions.includes("factory")
    ) {
        return {
            options,
            promises: [...promises, getSoroswapFactoryEvents(options)],
            subscriptions: [...subscriptions, "factory"],
        };
    }

    if (["router", "SoroswapRouter"].includes(contractType) && !subscriptions.includes("router")) {
        return {
            options,
            promises: [...promises, getSoroswapRouterEvents(options)],
            subscriptions: [...subscriptions, "router"],
        };
    }

    throw new Error("Invalid contract type");
};

const eventFetcher = (
    {
        options,
        promises,
        subscriptions,
    }: Readonly<{
        readonly options: Readonly<EventGetterOptions>;
        readonly promises: readonly Readonly<
            Promise<readonly (SoroswapEvent | RawSoroswapEvent)[]>
        >[];
        readonly subscriptions: readonly string[];
    }>,
    contractType: SoroswapContract,
): FetcherState => {
    switch (typeof contractType) {
        case "string": {
            return doStringContractType(contractType, promises, subscriptions, options);
        }
        case "object": {
            const pairsToFetchFrom = contractType.pair ?? contractType.SoroswapPair;

            return {
                options,
                promises: [...promises, getEventsFromSoroswapPairs(pairsToFetchFrom, options)],
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
 * @param [options] Options for event retrieval
 * @param {boolean} [options.shouldReturnRawEvents] If true, return events in
 * a less structured format, closer to how they are returned by the chain.
 * @returns A promise that resolves to the flat event array.
 * @throws If the events cannot be read.
 */
const getEventsFromSoroswapContracts = async (
    contractTypes: readonly SoroswapContract[],
    options?: Readonly<EventGetterOptions>,
): Promise<readonly SoroswapEvent[]> => {
    const { promises: returnedPromises } = contractTypes.reduce<FetcherState>(eventFetcher, {
        options: options ?? { shouldReturnRawEvents: false },
        promises: [],
        subscriptions: [],
    });

    const rawEvents = (await Promise.all(returnedPromises)) as SoroswapEvent[][];

    return rawEvents.flat();
};

export {
    getEventsFromSoroswapContracts,
    getEventsFromSoroswapPairs,
    getSoroswapFactoryEvents,
    getSoroswapPairEvents,
    getSoroswapRouterEvents,
};
