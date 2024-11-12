/**
 * Validates that a value is a non-empty string.
 * @param value The value to validate.
 * @param errorMessage The error message to throw.
 * @returns The input string, if it is valid.
 * @throws {Error} If the input string is empty or not even a string.
 */
export const validateString = (value: unknown, errorMessage: string): string => {
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
 * @throws {Error} If the environment variable is not defined.
 */
export const getEnvironmentVariable = (name: string): string => {
    const {
        env: { [name]: value },
    } = process;

    return validateString(value, `Missing required environment variable: ${name}`);
};
