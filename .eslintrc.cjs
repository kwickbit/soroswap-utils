"use strict";

module.exports = {
    extends: [
        "hardcore",
        "hardcore/ts",
        "hardcore/jest",
        "prettier"
    ],

    parserOptions: {
        project: "./tsconfig.eslint.json"
    },

    root: true,

    rules: {
        "putout/putout": "off",
        "unicorn/import-index": "off",
    }
}