import { join } from "path";
import { readFile, writeFile, mkdir } from "fs/promises";
import { homedir } from "os";

const SOROSWAP_ASSETS_URL =
    "https://raw.githubusercontent.com/soroswap/token-list/main/tokenList.json";

const CACHE_FILE = join(homedir(), ".cache", "soroswap-utils", "assets.json");
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Fetches the list of certified assets from the Soroswap token list.
 * Assets are cached for 30 days.
 * @param simple If true, returns a simpler object with only the code and issuer.
 * @returns {Promise<any>} A promise that resolves to the list of certified assets.
 */
export const listCertifiedAssets = async (simple = false): Promise<any> => {
    try {
        const data = await getCachedOrFetch();

        if (!simple) return data;

        return {
            assets: data.assets.map(({ code, issuer }: { code: string; issuer: string }) => ({
                code,
                issuer,
            })),
        };
    } catch (e) {
        console.error("Failed to get assets:", e);
        throw e;
    }
};

async function getCachedOrFetch() {
    try {
        const cached = await readFile(CACHE_FILE, "utf8");
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) return data;
    } catch {
        // File doesn't exist, can't be read, or invalid JSON - fetch fresh data
    }

    const response = await fetch(SOROSWAP_ASSETS_URL);
    const data = await response.json();
    await mkdir(join(homedir(), ".cache", "soroswap-utils"), { recursive: true });

    await writeFile(
        CACHE_FILE,
        JSON.stringify({
            data,
            timestamp: Date.now(),
        })
    );

    return data;
}

/**
 * Checks if a given asset is certified by Soroswap.
 * @param code The asset code.
 * @param issuer The asset issuer.
 * @returns {Promise<boolean>} A promise that resolves to true if the asset is certified, false otherwise.
 */
export const isCertifiedAsset = async (code: string, issuer: string): Promise<boolean> => {
    if (code === "XLM" && issuer === "Native") return true;

    const { assets } = await listCertifiedAssets();
    return assets.some((asset: { code: string; issuer: string }) => {
        return asset.code === code && asset.issuer === issuer;
    });
};
