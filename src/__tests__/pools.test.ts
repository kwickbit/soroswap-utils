import { describe, expect, it } from "@jest/globals";

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

        const count = await getLiquidityPoolCount();
        const data = await getLiquidityPoolAddresses();

        expect(data).toBeInstanceOf(Array);
        expect(data).toHaveLength(count);

        // All addresses should start with C and have 55 other characters, upper case and numbers
        expect(data.every((address: string) => /^C[\dA-Z]{55}$/v.exec(address))).toBe(true);
    });
});
