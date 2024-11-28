/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it, jest } from "@jest/globals";

import { initializeSoroswapUtils } from "../config";
import { getLiquidityPoolAddresses, getLiquidityPoolCount } from "../pools";

describe("getLiquidityPoolCount", () => {
    it("should return the total number of liquidity pools", async () => {
        expect.assertions(2);

        const data = await getLiquidityPoolCount();

        expect(typeof data).toBe("number");
        expect(data).toBeGreaterThan(0);
    });
});

describe("getLiquidityPoolAddresses", () => {
    it("should return an array of liquidity pool addresses", async () => {
        expect.assertions(3);

        // eslint-disable-next-line jest/no-confusing-set-timeout
        jest.setTimeout(30_000);

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

        const count = await getLiquidityPoolCount();
        const data = await getLiquidityPoolAddresses();

        expect(data).toBeInstanceOf(Array);
        expect(data).toHaveLength(count);

        // All addresses should start with C and have 55 other characters,
        // upper case and numbers
        expect(data.every((address: string) => /^C[\dA-Z]{55}$/v.exec(address))).toBe(true);
    });
});
