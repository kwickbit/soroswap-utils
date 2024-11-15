type SoroswapFactoryContract = "SoroswapFactory" | "factory";

type SoroswapRouterContract = "SoroswapRouter" | "router";

type SoroswapPairContract =
    // eslint-disable-next-line @typescript-eslint/naming-convention
    | { readonly pair: readonly string[]; readonly SoroswapPair?: never }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    | { readonly pair?: never; readonly SoroswapPair: readonly string[] };

type SoroswapContract = SoroswapFactoryContract | SoroswapRouterContract | SoroswapPairContract;

// We give the user the option to get the data in a simpler format.
interface SimpleAsset {
    readonly code: string;
    readonly contract: string;
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
    firstToken?: DetailedAsset;
    readonly poolContract: string;
    reserves: readonly [number, number];
    secondToken?: DetailedAsset;
}

export type {
    AssetData,
    CacheEntry,
    DetailedAsset,
    MainnetResponse,
    PoolData,
    SimpleAsset,
    SoroswapContract,
    TestnetAsset,
    TestnetData,
    TestnetResponse,
};
