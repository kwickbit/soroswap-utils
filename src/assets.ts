import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import type {
    AssetData,
    CacheEntry,
    DetailedAsset,
    MainnetResponse,
    SimpleAsset,
    TestnetAsset,
    TestnetData,
    TestnetResponse,
} from "./types";
import { getEnvironmentVariable } from "./utils";

const isTestnet = getEnvironmentVariable("IS_TESTNET") === "true";
const cacheDirectory = join(homedir(), ".cache", "soroswap-utils");

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
    try {
        await access(cacheDirectory);
    } catch {
        await mkdir(cacheDirectory);
    }
})();

const mainnetCacheFile = join(cacheDirectory, "assets.json");
const testnetCacheFile = join(cacheDirectory, "testnet-assets.json");

const daysToCache = 30;
const hoursPerDay = 24;
const minutesPerHour = 60;
const secondsPerMinute = 60;
const millisecondsPerSecond = 1000;

const cacheTtl =
    daysToCache * hoursPerDay * minutesPerHour * secondsPerMinute * millisecondsPerSecond;

const extractTestnetData = (data: TestnetResponse): TestnetData =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.find((item: Readonly<TestnetData>): boolean => item.network === "testnet")!;

//
// Besides fetching fresh data, we also overwrite the cache file.
//
const fetchAssets = async (): Promise<AssetData> => {
    // The env var is the same regardless of the network; the command line
    // sets the correct one.
    const response = await fetch(getEnvironmentVariable("SOROSWAP_ASSETS_URL"));
    const dataFromResponse = (await response.json()) as MainnetResponse | TestnetResponse;
    const data = isTestnet
        ? extractTestnetData(dataFromResponse as TestnetResponse)
        : (dataFromResponse as MainnetResponse);

    await writeFile(
        isTestnet ? testnetCacheFile : mainnetCacheFile,

        // Rule disabled because neither I nor Claude AI are smart enough to
        // figure out how to make this work.
        // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
        JSON.stringify({ data, timestamp: Date.now() }),
    );

    return data;
};

const readCache = async (): Promise<CacheEntry> => {
    const content = await readFile(isTestnet ? testnetCacheFile : mainnetCacheFile, "utf8");

    return JSON.parse(content) as CacheEntry;
};

const getCachedOrFetch = async (): Promise<AssetData> => {
    try {
        const cache = await readCache();
        const isDataFresh = Date.now() - cache.timestamp < cacheTtl;

        if (!isDataFresh) {
            return await fetchAssets();
        }

        if (!isTestnet) {
            return cache.data as MainnetResponse;
        }

        return cache.data as TestnetData;
    } catch {
        return await fetchAssets();
    }
};

const simplifyAssets = (data: AssetData): { assets: SimpleAsset[] } => ({
    assets: data.assets.map(({ code, contract, issuer }) => ({ code, contract, issuer })),
});

/**
 * Fetches the list of certified assets from the Soroswap token list.
 * Assets are cached for 30 days.
 * @param shouldReturnSimpleAssets If true, returns a simpler object with only
 * the code and issuer.
 * @returns A promise that resolves to the list of certified assets.
 * @throws If assets cannot be fetched or cached.
 */
export const listCertifiedAssets = async (
    shouldReturnSimpleAssets = false,
): Promise<AssetData | { assets: SimpleAsset[] }> => {
    try {
        const data: AssetData = await getCachedOrFetch();

        return shouldReturnSimpleAssets ? simplifyAssets(data) : data;
    } catch (error) {
        console.error("Failed to get assets:", error);

        throw error;
    }
};

/**
 * Checks if a given asset is certified by Soroswap.
 * @param code The asset code.
 * @param contract The address of the asset contract.
 * @returns A promise that resolves to true if the asset is certified.
 */
export const isCertifiedAsset = async (code: string, contract: string): Promise<boolean> => {
    if (code === "XLM" && contract === "Native") {
        return true;
    }

    const { assets } = await listCertifiedAssets();

    return assets.some(
        (asset: { readonly code: string; readonly contract: string }) =>
            asset.code === code && asset.contract === contract,
    );
};

/**
 * Retrieves data about an asset.
 *
 * @param address The address of the asset.
 * @returns A promise that resolves to the data about the asset.
 * @throws If asset not found (in mainnet only)
 */
export const getAssetData = async (
    address: string,
): Promise<DetailedAsset | TestnetAsset | undefined> => {
    const soroswapAssets = await getCachedOrFetch();
    const assetData = soroswapAssets.assets.find((asset) => asset.contract === address);

    // On the testnet it seems possible to create pools with
    // non-existent assets, so we let them pass through.
    if (assetData === undefined && !isTestnet) {
        throw new Error(`Asset from contract ${address} not found`);
    }

    return assetData;
};
