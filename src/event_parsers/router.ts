import { getCachedOrFetch } from "../assets";
import type {
    Asset,
    AssetData,
    RawRouterEvent,
    RawRouterInitEvent,
    RawRouterLiquidityEvent,
    RawRouterSwapEvent,
    RouterAddLiquidityEvent,
    RouterEvent,
    RouterInitializedEvent,
    RouterRemoveLiquidityEvent,
    RouterSwapEvent,
} from "../types";
import { parseCommonProperties } from "./common";

const doGetAssetData = (assets: AssetData, token: string): Asset => {
    const assetData = assets.assets.find((asset) => asset.contract === token);

    // We have full data for a list of certified assets, but it is possible to
    // have other tokens in pools, and those we don't have data for.
    if (assetData === undefined) {
        return { contract: token, isSoroswapCertified: false };
    }

    return assetData;
};

const parseRouterAddLiquidityEvent = (
    rawEvent: RawRouterLiquidityEvent & { readonly topic2: "add" },
    soroswapAssets: AssetData,
): RouterAddLiquidityEvent => ({
    ...parseCommonProperties(rawEvent),
    amountOfFirstTokenDeposited: BigInt(rawEvent.amount_a),
    amountOfSecondTokenDeposited: BigInt(rawEvent.amount_b),
    firstToken: doGetAssetData(soroswapAssets, rawEvent.token_a),
    liquidityPoolAddress: rawEvent.pair,
    liquidityPoolTokensMinted: BigInt(rawEvent.liquidity),
    recipientAddress: rawEvent.to,
    secondToken: doGetAssetData(soroswapAssets, rawEvent.token_b),
});

const parseRouterInitEvent = (rawEvent: RawRouterInitEvent): RouterInitializedEvent => ({
    ...parseCommonProperties(rawEvent),
    factoryAddress: rawEvent.factory,
});

const parseRouterRemoveLiquidityEvent = (
    rawEvent: RawRouterLiquidityEvent & { readonly topic2: "remove" },
    soroswapAssets: AssetData,
): RouterRemoveLiquidityEvent => ({
    ...parseCommonProperties(rawEvent),
    amountOfFirstTokenWithdrawn: BigInt(rawEvent.amount_a),
    amountOfSecondTokenWithdrawn: BigInt(rawEvent.amount_b),
    firstToken: doGetAssetData(soroswapAssets, rawEvent.token_a),
    liquidityPoolAddress: rawEvent.pair,
    liquidityPoolTokensBurned: BigInt(rawEvent.liquidity),
    recipientAddress: rawEvent.to,
    secondToken: doGetAssetData(soroswapAssets, rawEvent.token_b),
});

const parseRouterSwapEvent = (
    rawEvent: RawRouterSwapEvent,
    soroswapAssets: AssetData,
): RouterSwapEvent => ({
    ...parseCommonProperties(rawEvent),
    recipientAddress: rawEvent.to,
    tokenAmountsInSequence: rawEvent.amounts.map(BigInt),

    tradedTokenSequence: rawEvent.path.map((token) => doGetAssetData(soroswapAssets, token)),
});

const parseRouterEvent = async (rawEvent: RawRouterEvent): Promise<RouterEvent> => {
    const soroswapAssets = await getCachedOrFetch();

    switch (rawEvent.topic2) {
        case "add": {
            return parseRouterAddLiquidityEvent(
                rawEvent as RawRouterLiquidityEvent & { topic2: "add" },
                soroswapAssets,
            );
        }
        case "init": {
            return parseRouterInitEvent(rawEvent);
        }
        case "remove": {
            return parseRouterRemoveLiquidityEvent(
                rawEvent as RawRouterLiquidityEvent & { topic2: "remove" },
                soroswapAssets,
            );
        }
        case "swap": {
            return parseRouterSwapEvent(rawEvent, soroswapAssets);
        }

        default: {
            throw new Error("Unknown SoroswapRouter event type.");
        }
    }
};

export { parseRouterEvent };
