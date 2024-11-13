// eslint-disable-next-line import/no-extraneous-dependencies
import { getContractEventsParser, Mercury } from "mercury-sdk";

import { getEnvironmentVariable } from "./utils";

const buildMercuryInstance = (): Mercury => {
    const mercuryArguments = {
        apiKey: getEnvironmentVariable("MERCURY_API_KEY"),
        backendEndpoint: getEnvironmentVariable("MERCURY_BACKEND_ENDPOINT"),
        graphqlEndpoint: getEnvironmentVariable("MERCURY_GRAPHQL_ENDPOINT"),
    };

    return new Mercury(mercuryArguments);
};

const soroswapSubscriber = (environmentVariable: string) => async () => {
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
    await soroswapSubscriber("SOROSWAP_FACTORY_CONTRACT")();

/**
 * The Soroswap Router contract emits events when a swap is executed.
 * Use this function to subscribe to those events.
 * @returns {Promise<boolean>} A promise that resolves to true if the
 * subscription was successful.
 */
export const subscribeToSoroswapRouter = async (): Promise<boolean> =>
    await soroswapSubscriber("SOROSWAP_ROUTER_CONTRACT")();

/**
 * Retrieve Soroswap Factory contract events.
 * @returns {Promise<unknown>} A promise that resolves to the event array.
 * @throws {Error} If the events cannot be read.
 */
export const getSoroswapFactoryEvents = async (): Promise<unknown> => {
    const mercuryInstance = buildMercuryInstance();

    const soroswapEvents = await mercuryInstance.getContractEvents({
        contractId: getEnvironmentVariable("SOROSWAP_FACTORY_CONTRACT"),
    });

    if (soroswapEvents.error !== undefined) {
        throw new Error(soroswapEvents.error);
    }

    if (soroswapEvents.data === null) {
        throw new Error("No events found");
    }

    return getContractEventsParser(soroswapEvents.data);
};
