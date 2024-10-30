import { Mercury } from "mercury-sdk";
import "dotenv/config";

(async () => {
    const mercury = new Mercury({
        backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT!,
        graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT!,
        email: process.env.MERCURY_TESTER_EMAIL!,
        password: process.env.MERCURY_TESTER_PASSWORD!,
        apiKey: process.env.MERCURY_API_KEY!,
    });

    const response = await mercury?.subscribeToContractEvents({
        contractId: process.env.SOROSWAP_FACTORY_CONTRACT!,
    });

    console.log(response);
})();
