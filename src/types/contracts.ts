/* eslint-disable @typescript-eslint/naming-convention */
type SoroswapFactoryContract = "SoroswapFactory" | "factory";

type SoroswapRouterContract = "SoroswapRouter" | "router";

type SoroswapPairContract =
    | { readonly pair: readonly string[]; readonly SoroswapPair?: never }
    | { readonly pair?: never; readonly SoroswapPair: readonly string[] };

export type SoroswapContract =
    | SoroswapFactoryContract
    | SoroswapRouterContract
    | SoroswapPairContract;
