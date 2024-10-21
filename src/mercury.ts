import { Mercury } from "mercury-sdk";

const mercury = new Mercury({
    backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT!,
    graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT!,
    email: process.env.MERCURY_TESTER_EMAIL!,
    password: process.env.MERCURY_TESTER_PASSWORD!,
});

const response = await mercury.subscribeToContractEvents({
    contractId: process.env.SOROSWAP_TESTNET_CONTRACT!,
});

console.log(response);
