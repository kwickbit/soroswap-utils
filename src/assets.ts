import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import type { CachedData, CacheEntry } from "./types";

const soroswapAssetsUrl =
    "https://raw.githubusercontent.com/soroswap/token-list/main/tokenList.json";

const cacheFile = join(homedir(), ".cache", "soroswap-utils", "assets.json");
const daysToCache = 30;
const hoursPerDay = 24;
const minutesPerHour = 60;
const secondsPerMinute = 60;
const millisecondsPerSecond = 1000;
const cacheTtl =
    daysToCache * hoursPerDay * minutesPerHour * secondsPerMinute * millisecondsPerSecond;

//
// Besides fetching fresh data, we also overwrite the cache file.
//
const fetchAssets = async (): Promise<CachedData> => {
    const response = await fetch(soroswapAssetsUrl);
    const data = (await response.json()) as CachedData;

    // Rule disabled because I cannot change the `recursive` parameter name.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await mkdir(join(homedir(), ".cache", "soroswap-utils"), { recursive: true });

    await writeFile(
        cacheFile,

        // Rule disabled because neither I nor Claude AI are smart enough to
        // figure out how to make this work.
        // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
        JSON.stringify({
            data,
            timestamp: Date.now(),
        }),
    );

    return data;
};

const getCachedOrFetch = async (): Promise<CachedData> => {
    try {
        // First we see if we have cached data from the last 30 days.
        // Soroswap updates their token list relatively infrequently.
        const cached = await readFile(cacheFile, "utf8");
        const { data, timestamp } = JSON.parse(cached) as CacheEntry;

        // If the cache is fresh we return it, otherwise we fetch fresh data.
        if (Date.now() - timestamp < cacheTtl) {
            return data;
        }
    } catch {
        // File doesn't exist, can't be read, or invalid JSON - fetch fresh data
    }

    return await fetchAssets();
};

/**
 * Fetches the list of certified assets from the Soroswap token list.
 * Assets are cached for 30 days.
 * @param shouldReturnSimpleAssets If true, returns a simpler object with only
 * the code and issuer.
 * @returns {Promise<any>} A promise that resolves to the list of certified
 * assets.
 */
export const listCertifiedAssets = async (
    shouldReturnSimpleAssets = false,
): Promise<CachedData> => {
    try {
        const data = await getCachedOrFetch();

        if (!shouldReturnSimpleAssets) {
            return data;
        }

        return {
            assets: data.assets.map(
                ({ code, issuer }: { readonly code: string; readonly issuer: string }) => ({
                    code,
                    issuer,
                }),
            ),
        };
    } catch (error) {
        console.error("Failed to get assets:", error);

        throw error;
    }
};

/**
 * Checks if a given asset is certified by Soroswap.
 * @param code The asset code.
 * @param issuer The asset issuer.
 * @returns {Promise<boolean>} A promise that resolves to true if the asset is
 * certified.
 */
export const isCertifiedAsset = async (code: string, issuer: string): Promise<boolean> => {
    if (code === "XLM" && issuer === "Native") {
        return true;
    }

    const { assets } = await listCertifiedAssets();

    return assets.some(
        (asset: { readonly code: string; readonly issuer: string }) =>
            asset.code === code && asset.issuer === issuer,
    );
};
