import { Mercury } from "mercury-sdk";

import { getConfig } from "./config";

type Color = "red" | "green" | "yellow" | "magenta" | "cyan";

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
const colors: Record<Color, string> = {
    cyan: "\u001B[36m",
    green: "\u001B[32m",
    magenta: "\u001B[35m",
    red: "\u001B[31m",
    yellow: "\u001B[33m",
};

const getColoredMessage = (color: Color, message: string): string =>
    `${colors[color]}${message}\u001B[0m`;

/**
 * Validates that a value is a non-empty string.
 * @param value The value to validate.
 * @param errorMessage The error message to throw.
 * @returns The input string, if it is valid.
 * @throws If the input string is empty or not even a string.
 */
const validateString = (value: unknown, errorMessage: string): string => {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(errorMessage);
    } else {
        return value;
    }
};

/**
 * Builds a Mercury instance, used to subscribe to contracts and read
 * their events.
 * @returns A Mercury instance.
 */
const buildMercuryInstance = (): Mercury => {
    const config = getConfig();
    const mercuryArguments = {
        apiKey: config.mercury.apiKey,
        backendEndpoint: config.mercury.backendEndpoint,
        graphqlEndpoint: config.mercury.graphqlEndpoint,
    };

    return new Mercury(mercuryArguments);
};

const resolveContractId = (contractId: string, isEnvironmentVariable: boolean): string => {
    const { contracts } = getConfig();

    if (!isEnvironmentVariable) {
        return contractId;
    }

    switch (contractId) {
        case "SOROSWAP_FACTORY_CONTRACT": {
            return contracts.factory;
        }
        case "SOROSWAP_ROUTER_CONTRACT": {
            return contracts.router;
        }

        default: {
            throw new Error(`Unknown contract type: ${contractId}`);
        }
    }
};

export { buildMercuryInstance, getColoredMessage, resolveContractId, validateString };
