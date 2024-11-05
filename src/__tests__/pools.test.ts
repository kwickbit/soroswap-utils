import { getLiquidityPoolAddresses, getLiquidityPoolCount } from "../pools";

describe("getLiquidityPoolCount", () => {
    it("should return the total number of liquidity pools", async () => {
        const data = await getLiquidityPoolCount();
        expect(typeof data).toBe('number');
        expect(data).toBeGreaterThan(0);
    });
});

describe("getLiquidityPoolAddresses", () => {
    it("should return an array of liquidity pool addresses", async () => {
        const count = await getLiquidityPoolCount();
        const data = await getLiquidityPoolAddresses();
        expect(data).toBeInstanceOf(Array);
        expect(data.length).toBe(count);
        // All addresses should start with C and have 55 other characters, upper case and numbers
        expect(
            data.every(
                (address: string) => address.match(/^C[A-Z0-9]{55}$/)
            )
        ).toBe(true);
    });
});
