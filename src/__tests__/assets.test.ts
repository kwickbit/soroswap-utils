import { describe, expect, it } from "@jest/globals";

import { isCertifiedAsset, listCertifiedAssets } from "../assets";
import type { SimpleAsset, TestnetAsset, TestnetData } from "../types";

describe("listCertifiedAssets", () => {
    it("should return a list of certified assets", async () => {
        expect.hasAssertions();

        const data = (await listCertifiedAssets()) as TestnetData;

        expect(data.network).toBe("testnet");
        expect(Array.isArray(data.assets)).toBe(true);
        expect(data.assets).not.toHaveLength(0);

        const expectedAssetKeys: readonly (keyof TestnetAsset)[] = [
            "name",
            "code",
            "contract",
            "icon",
        ];

        data.assets.forEach((asset: Readonly<TestnetAsset>) => {
            expectedAssetKeys.forEach((key) => {
                expect(asset).toHaveProperty(key);
                expect(asset[key]).toStrictEqual(expect.any(String));
                expect(asset.decimals).toStrictEqual(expect.any(Number));
            });
        });
    });

    it("should return simplified asset list when requested", async () => {
        expect.hasAssertions();

        const { assets } = await listCertifiedAssets(true);

        expect(Array.isArray(assets)).toBe(true);
        expect(assets).not.toHaveLength(0);

        assets.forEach((asset: Readonly<SimpleAsset>) => {
            // Code, contract, issuer, and isSoroswapCertified
            expect(Object.keys(asset)).toHaveLength(4);

            expect(asset.code).toStrictEqual(expect.any(String));

            try {
                expect(asset.issuer).toStrictEqual(expect.any(String));
            } catch {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(asset.issuer).toBeUndefined();
            }
        });
    });
});

describe("isCertifiedAsset", () => {
    // This test is disabled because for some reason it never returns.

    it("should return true for XLM", async () => {
        expect.assertions(1);

        await expect(isCertifiedAsset("XLM", "Native")).resolves.toBe(true);
    });

    it("should return true for a certified testnet asset", async () => {
        expect.assertions(1);

        // This test will break whenever the testnet reboots. Oh well.
        await expect(
            isCertifiedAsset("ARST", "CATYSR2RNCFKMYNBH6SFWLBJ5ZJTPRQD575I5Q66UHYMMAPNFQOU5AJZ"),
        ).resolves.toBe(true);
    });

    it("should return false for ShadyCoin", async () => {
        expect.assertions(1);

        await expect(
            isCertifiedAsset(
                "ShadyCoin",
                "GPONZIMAD0FFNIGERI4NPRINCE171WHOWANTSTOBEABILLIONAIRE171",
            ),
        ).resolves.toBe(false);
    });
});
