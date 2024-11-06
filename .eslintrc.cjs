"use strict";

const maximumLineLength = 100;

module.exports = {
    extends: ["hardcore", "hardcore/ts", "hardcore/jest", "prettier"],

    parserOptions: {
        project: "./tsconfig.eslint.json",
    },

    plugins: ["prettier"],

    root: true,

    rules: {
        "@stylistic/max-len": [
            "error",
            {
                code: maximumLineLength,
                ignorePattern: String.raw`^\s*//\s*eslint-disable`,
            },
        ],

        "@typescript-eslint/consistent-type-assertions": [
            "error",
            { assertionStyle: "as", objectLiteralTypeAssertions: "allow" },
        ],

        "@typescript-eslint/no-shadow": ["error", { allow: ["expect"] }],
        "@typescript-eslint/no-throw-literal": "off",
        "compat/compat": "off",
        "func-style": ["error", "declaration", { allowArrowFunctions: true }],
        "no-console": "off",
        "prettier/prettier": ["error", { printWidth: maximumLineLength, tabWidth: 4 }],
        "putout/putout": "off",
        "unicorn/import-index": "off",
    },
};
