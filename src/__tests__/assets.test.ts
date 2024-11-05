import { isCertifiedAsset, listCertifiedAssets } from "../assets";

describe("listCertifiedAssets", () => {
    it("should return a list of certified assets", async () => {
        const data = await listCertifiedAssets();

        const dataProperties = [
            "description",
            "feedback",
            "name",
            "network",
            "provider",
            "version",
        ];

        dataProperties.forEach((property: string) => {
            expect(data).toHaveProperty(property);
            expect(typeof data[property]).toBe("string");
        });

        const { assets } = data;
        expect(assets).toBeInstanceOf(Array);
        expect(assets.length).toBeGreaterThan(0);

        assets.forEach((asset: any) => {
            const assetProperties = [
                "name",
                "code",
                "issuer",
                "contract",
                "org",
                "domain",
                "icon",
                "decimals",
            ];

            assetProperties.forEach((property: string) => {
                expect(asset).toHaveProperty(property);

                if (property === "decimals") {
                    expect(typeof asset[property]).toBe("number");
                    return;
                }

                expect(typeof asset[property]).toBe("string");
            });
        });
    });

    it.skip("should return simplified asset list when requested", async () => {
        const { assets } = await listCertifiedAssets(true);

        expect(assets).toBeInstanceOf(Array);
        expect(assets.length).toBeGreaterThan(0);

        assets.forEach((asset: any) => {
            expect(Object.keys(asset)).toHaveLength(2);
            expect(asset).toHaveProperty("code");
            expect(asset).toHaveProperty("issuer");
            expect(typeof asset.code).toBe("string");
            expect(typeof asset.issuer).toBe("string");
        });
    });
});

describe("isCertifiedAsset", () => {
    it("should return true for XLM", async () => {
        await expect(isCertifiedAsset("XLM", "Native")).resolves.toBe(true);
    });

    it("should return true for ETH", async () => {
        await expect(
            isCertifiedAsset("ETH", "GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5")
        ).resolves.toBe(true);
    });

    it("should return false for ShadyCoin", async () => {
        await expect(
            isCertifiedAsset(
                "ShadyCoin",
                "GPONZIMAD0FFNIGERI4NPRINCE171WHOWANTSTOBEABILLIONAIRE171"
            )
        ).resolves.toBe(false);
    });
});
