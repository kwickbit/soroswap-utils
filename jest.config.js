/** @type {import('ts-jest').JestConfigWithTsJest} */
const defaultExport = {
    extensionsToTreatAsEsm: [".ts"],

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },

    testEnvironment: "node",

    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
};

export default defaultExport;
