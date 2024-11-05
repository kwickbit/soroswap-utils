import { listCertifiedAssets } from "../assets";

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
            expect(typeof data[property]).toBe('string');
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
                    expect(asset[property]).toBeInstanceOf(Number);
                    return;
                }

                expect(typeof data[property]).toBe('string');
            });
        });
    });
});
