interface UncertifiedAsset {
    readonly contract: string;
    readonly isSoroswapCertified: false;
}

// We give the user the option to get the data in a simpler format.
interface SimpleAsset {
    readonly code: string;
    readonly contract: string;
    readonly isSoroswapCertified: boolean;
    readonly issuer: string;
}

interface TestnetAsset extends SimpleAsset {
    readonly decimals: number;
    readonly icon: string;
    readonly name: string;
}

interface DetailedAsset extends TestnetAsset {
    readonly domain: string;
    readonly org: string;
}

type Asset = DetailedAsset | TestnetAsset | UncertifiedAsset;

interface TestnetData {
    readonly assets: readonly TestnetAsset[];
    readonly network: "mainnet" | "testnet" | "standalone";
}

type TestnetResponse = readonly TestnetData[];

interface MainnetResponse {
    readonly assets: readonly DetailedAsset[];
    readonly description: string;
    readonly feedback: string;
    readonly name: string;
    readonly network: string;
    readonly provider: string;
    readonly version: string;
}

type AssetData = MainnetResponse | TestnetData;

interface CacheEntry {
    readonly data: AssetData;
    readonly timestamp: number;
}

interface PoolData {
    constantProductOfReserves: number;
    firstToken: Asset;
    readonly poolContract: string;
    reserves: readonly [number, number];
    secondToken: Asset;
}

export type {
    Asset,
    AssetData,
    CacheEntry,
    MainnetResponse,
    PoolData,
    SimpleAsset,
    TestnetAsset,
    TestnetData,
    TestnetResponse,
};
