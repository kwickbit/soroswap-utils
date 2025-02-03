import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getConfig } from "./config";
import type {
    Asset,
    AssetData,
    CacheEntry,
    MainnetResponse,
    SimpleAsset,
    TestnetData,
    TestnetResponse,
} from "./types";

const cacheDirectory = join(process.cwd(), "node_modules", "soroswap-utils", ".cache");

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
    try {
        await access(cacheDirectory);
    } catch {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        await mkdir(cacheDirectory, { recursive: true });
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
    // The env var name is the same regardless of the network; the command line
    // sets the correct environment.
    const config = getConfig();
    const response = await fetch(config.assets.url);
    const dataFromResponse = (await response.json()) as MainnetResponse | TestnetResponse;
    const isTestnet = config.rpc.url.includes("testnet");

    const data = isTestnet
        ? extractTestnetData(dataFromResponse as TestnetResponse)
        : (dataFromResponse as MainnetResponse);

    // We will consider as certified only the mainnet assets.
    const certifiedData = {
        ...data,
        assets: data.assets.map((asset) => ({ ...asset, isSoroswapCertified: !isTestnet })),
    };

    await writeFile(
        isTestnet ? testnetCacheFile : mainnetCacheFile,

        // Rule disabled because neither I nor Claude AI are smart enough to
        // figure out how to make this work.
        // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
        JSON.stringify({ data: certifiedData, timestamp: Date.now() }),
    );

    return data;
};

const readCache = async (): Promise<CacheEntry> => {
    const isTestnet = getConfig().rpc.url.includes("testnet");
    const content = await readFile(isTestnet ? testnetCacheFile : mainnetCacheFile, "utf8");

    return JSON.parse(content) as CacheEntry;
};

// eslint-disable-next-line max-statements
const getCachedOrFetch = async (): Promise<AssetData> => {
    try {
        const cache = await readCache();
        const isDataFresh = Date.now() - cache.timestamp < cacheTtl;

        if (!isDataFresh) {
            console.log(
                "ERROR: fetching assets from the network when they should be read from cache.",
            );

            return await fetchAssets();
        }

        console.log("Using cached assets, which means the error is not here.");

        const isTestnet = getConfig().rpc.url.includes("testnet");

        if (!isTestnet) {
            console.log("Fetching assets from mainnet, as it should be.");

            return cache.data as MainnetResponse;
        }

        console.log("ERROR: fetching assets from testnet, as it should NOT be.");

        return cache.data as TestnetData;
    } catch {
        return await fetchAssets();
    }
};

const simplifyAssets = (data: AssetData): { assets: SimpleAsset[] } => ({
    assets: data.assets.map(({ code, contract, isSoroswapCertified, issuer }) => ({
        code,
        contract,
        isSoroswapCertified,
        issuer,
    })),
});

/**
 * Fetches the list of certified assets from the Soroswap token list.
 * Assets are cached for 30 days.
 * @param shouldReturnSimpleAssets If true, returns a simpler object with only
 * the code and issuer.
 * @returns A promise that resolves to the list of certified assets.
 * @throws If assets cannot be fetched or cached.
 */
const listCertifiedAssets = async (
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
const isCertifiedAsset = async (code: string, contract: string): Promise<boolean> => {
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
 * @param contract The address of the asset's contract.
 * @returns A promise that resolves to the data about the asset.
 * @throws If asset not found (in mainnet only)
 */
const getAssetData = async (contract: string): Promise<Asset> => {
    const soroswapAssets = await getCachedOrFetch();
    const assetData = soroswapAssets.assets.find((asset) => asset.contract === contract);

    // We have full data for a list of certified assets, but it is possible to
    // have other tokens in pools, and those we don't have data for.
    if (assetData === undefined) {
        return { contract, isSoroswapCertified: false };
    }

    return assetData;
};

export { getAssetData, isCertifiedAsset, listCertifiedAssets };
