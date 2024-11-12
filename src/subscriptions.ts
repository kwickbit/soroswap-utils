// eslint-disable-next-line import/no-extraneous-dependencies
import { Mercury } from "mercury-sdk";

import { getEnvironmentVariable } from "./utils";

const soroswapSubscriber = (environmentVariable: string) => async () => {
    const mercuryArguments = {
        apiKey: getEnvironmentVariable("MERCURY_API_KEY"),
        backendEndpoint: getEnvironmentVariable("MERCURY_BACKEND_ENDPOINT"),
        graphqlEndpoint: getEnvironmentVariable("MERCURY_GRAPHQL_ENDPOINT"),
    };

    const mercury = new Mercury(mercuryArguments);

    const response = await mercury.subscribeToContractEvents({
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
