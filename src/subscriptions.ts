import type { SoroswapContract } from "./types";
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
 * @returns A promise that resolves to true if the subscription was successful.
 */
const subscribeToSoroswapFactory = async (): Promise<boolean> =>
    await soroswapSubscriber("SOROSWAP_FACTORY_CONTRACT", true);

/**
 * The Soroswap Router contract emits events when a swap is executed.
 * Use this function to subscribe to those events.
 * @returns A promise that resolves to true if the subscription was successful.
 */
const subscribeToSoroswapRouter = async (): Promise<boolean> =>
    await soroswapSubscriber("SOROSWAP_ROUTER_CONTRACT", true);

/**
 * Soroswap Pair contracts emit events for operations such as adding or
 * removing liquidity, swapping, or skimming.
 * Use this function to subscribe to those events.
 * @param pairContract The contract ID of the Soroswap Pair contract.
 * @returns A promise that resolves to true if the subscription was successful.
 */
const subscribeToSoroswapPair = async (pairContract: string): Promise<boolean> =>
    await soroswapSubscriber(pairContract);

/**
 * Subscribe to multiple SoroswapPair contracts.
 * @param contractIds An array of contract IDs to subscribe to.
 * @returns A promise that resolves to true if all subscriptions
 * were successful.
 */
const subscribeToSoroswapPairs = async (contractIds: readonly string[]): Promise<boolean> => {
    const promises = contractIds.map(
        async (pairContract) => await soroswapSubscriber(pairContract),
    );

    return await Promise.all(promises).then((results) => results.every(Boolean));
};

const doStringContractType = (
    contractType: string,
    subscriptions: readonly string[],
    promises: readonly Readonly<Promise<boolean>>[],
): { promises: Promise<boolean>[]; subscriptions: string[] } => {
    if (
        ["factory", "SoroswapFactory"].includes(contractType) &&
        !subscriptions.includes("factory")
    ) {
        return {
            promises: [...promises, subscribeToSoroswapFactory()],
            subscriptions: [...subscriptions, "factory"],
        };
    }

    if (["router", "SoroswapRouter"].includes(contractType) && !subscriptions.includes("router")) {
        return {
            promises: [...promises, subscribeToSoroswapRouter()],
            subscriptions: [...subscriptions, "router"],
        };
    }

    throw new Error("Invalid contract type");
};

const contractSubscriber = (
    {
        promises,
        subscriptions,
    }: Readonly<{
        promises: readonly Readonly<Promise<boolean>>[];
        subscriptions: readonly string[];
    }>,
    contractType: SoroswapContract,
): { promises: Promise<boolean>[]; subscriptions: string[] } => {
    switch (typeof contractType) {
        case "string": {
            return doStringContractType(contractType, subscriptions, promises);
        }
        case "object": {
            const pairsToSubscribeTo = contractType.pair ?? contractType.SoroswapPair;

            return {
                promises: [...promises, subscribeToSoroswapPairs(pairsToSubscribeTo)],
                subscriptions: [...subscriptions, ...pairsToSubscribeTo],
            };
        }

        default: {
            throw new Error("Invalid contract type");
        }
    }
};

/**
 * Subscribe to Soroswap contracts of the given types.
 * @param contractTypes An array of types of contracts to subscribe to.
 * These can be:
 *  - the strings "SoroswapFactory" or "factory"
 *  - the strings "SoroswapRouter" or "router"
 *  - an object with either the key "SoroswapPair" or just "pair" and the value
 *    an array of contract IDs to subscribe to.
 * @returns A promise that resolves to true if all subscriptions
 * were successful.
 */
const subscribeToSoroswapContracts = async (
    contractTypes: readonly SoroswapContract[],
): Promise<boolean> => {
    const { promises: returnedPromises } = contractTypes.reduce(contractSubscriber, {
        promises: [] as Promise<boolean>[],
        subscriptions: [] as string[],
    });

    return await Promise.all(returnedPromises).then((results) => results.every(Boolean));
};

export {
    subscribeToSoroswapContracts,
    subscribeToSoroswapFactory,
    subscribeToSoroswapPair,
    subscribeToSoroswapPairs,
    subscribeToSoroswapRouter,
};
