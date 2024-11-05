module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true
    },
    extends: [
        "hardcore",
        "hardcore/ts",
        "hardcore/jest",
        "prettier"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022
    },
    plugins: [
        "@typescript-eslint"
    ]
}