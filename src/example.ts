/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    getEventsFromSoroswapContracts,
    getLiquidityPoolAddresses,
    getLiquidityPoolData,
    initializeSoroswapUtils,
    subscribeToSoroswapPair,
} from "./index";
import { getColoredMessage } from "./utils";

// eslint-disable-next-line max-statements, unicorn/prefer-top-level-await
void (async () => {
    initializeSoroswapUtils({
        mercury: {
            apiKey: process.env.MERCURY_API_KEY!,
            backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT!,
            graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT!,
        },

        rpc: {
            privateKey: process.env.STELLAR_WALLET_PRIVATE_KEY!,
        },
    });

    try {
        const pools = await getLiquidityPoolAddresses();

        console.log(getColoredMessage("cyan", `Found ${pools.length} liquidity pools`));

        const { 0: firstPool } = pools;
        const poolData = await getLiquidityPoolData(firstPool as string);

        console.log(getColoredMessage("green", "\nFirst pool details:"));
        console.log(`Address: ${poolData.poolContract}`);
        console.log(`First token: ${poolData.firstToken.contract}`);
        console.log(`Second token: ${poolData.secondToken.contract}`);
        console.log(`Current reserves: ${poolData.reserves[0]}/${poolData.reserves[1]}`);
        console.log(`Current constant product: ${poolData.constantProductOfReserves}`);

        console.log(getColoredMessage("yellow", "\nSubscribing to pool events..."));
        await subscribeToSoroswapPair(firstPool as string);

        console.log(getColoredMessage("magenta", "\nFetching recent events:"));

        const events = await getEventsFromSoroswapContracts([{ pair: [firstPool as string] }]);

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        events.slice(0, 3).forEach((event) => {
            console.log(`\n${event.eventType.toUpperCase()}:`);
            console.log(event);
        });
    } catch (error) {
        console.error(getColoredMessage("red", "\nError:"), error);
    }
})();
