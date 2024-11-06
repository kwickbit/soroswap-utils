// Rule disabled because either I'm not smart enough to make it work,
// or ESLint is broken, because this is used in the test.
export interface Asset {
    code: string;
    contract?: string;
    decimals?: number;
    domain?: string;
    icon?: string;
    issuer: string;
    name?: string;
    org?: string;
}

export interface TokenList {
    assets: Asset[];
    description: string;
    feedback: string;
    name: string;
    network: string;
    provider: string;
    version: string;
}

export type CachedData =
    | TokenList
    | {
          assets: Asset[];
      };

export interface CacheEntry {
    data: CachedData;
    timestamp: number;
}
