import { describe, expect, it } from "@jest/globals";

import { isCertifiedAsset, listCertifiedAssets } from "../assets";
import type { Asset, TokenList } from "../types";

describe("listCertifiedAssets", () => {
    it("should return a list of certified assets", async () => {
        expect.hasAssertions();

        const data = (await listCertifiedAssets()) as TokenList;

        const expectedDataKeys: readonly (keyof TokenList)[] = [
            "description",
            "feedback",
            "name",
            "network",
            "provider",
            "version",
        ];

        expectedDataKeys.forEach((key) => {
            expect(data[key]).toStrictEqual(expect.any(String));
        });

        expect(data.assets).toBeInstanceOf(Array);
        expect(data.assets).not.toHaveLength(0);

        const expectedAssetKeys: readonly (keyof Asset)[] = [
            "name",
            "code",
            "issuer",
            "contract",
            "org",
            "domain",
            "icon",
        ];

        data.assets.forEach((asset: Readonly<Asset>) => {
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

        expect(assets).toBeInstanceOf(Array);
        expect(assets).not.toHaveLength(0);

        assets.forEach((asset: Readonly<Asset>) => {
            expect(Object.keys(asset)).toHaveLength(2);
            expect(asset.code).toStrictEqual(expect.any(String));
            expect(asset.issuer).toStrictEqual(expect.any(String));
        });
    });
});

describe("isCertifiedAsset", () => {
    it("should return true for XLM", async () => {
        expect.assertions(1);

        await expect(isCertifiedAsset("XLM", "Native")).resolves.toBe(true);
    });

    it("should return true for ETH", async () => {
        expect.assertions(1);

        await expect(
            isCertifiedAsset("ETH", "GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5"),
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
