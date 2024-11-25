// eslint-disable-next-line import/no-extraneous-dependencies
import { Mercury } from "mercury-sdk";

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
 * Retrieves an environment variable, throwing an error if it is not defined.
 * @param name The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws If the environment variable is not defined.
 */
const getEnvironmentVariable = (name: string): string => {
    const {
        env: { [name]: value },
    } = process;

    return validateString(value, `Missing required environment variable: ${name}`);
};

/**
 * Builds a Mercury instance, used to subscribe to contracts and read
 * their events.
 * @returns A Mercury instance.
 */
const buildMercuryInstance = (): Mercury => {
    const mercuryArguments = {
        apiKey: getEnvironmentVariable("MERCURY_API_KEY"),
        backendEndpoint: getEnvironmentVariable("MERCURY_BACKEND_ENDPOINT"),
        graphqlEndpoint: getEnvironmentVariable("MERCURY_GRAPHQL_ENDPOINT"),
    };

    return new Mercury(mercuryArguments);
};

export { buildMercuryInstance, getColoredMessage, getEnvironmentVariable, validateString };
