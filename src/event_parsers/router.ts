import type {
    Asset,
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

const doGetAssetData = (assets: readonly Asset[], token: string): Asset => {
    const assetData = assets.find((asset) => asset.contract === token);

    // We have full data for a list of certified assets, but it is possible to
    // have other tokens in pools, and those we don't have data for.
    if (assetData === undefined) {
        return { contract: token, isSoroswapCertified: false };
    }

    return assetData;
};

const parseRouterAddLiquidityEvent = (
    rawEvent: RawRouterLiquidityEvent & { readonly topic2: "add" },
    assets: readonly Asset[],
): RouterAddLiquidityEvent => ({
    ...parseCommonProperties(rawEvent),
    amountOfFirstTokenDeposited: BigInt(rawEvent.amount_a),
    amountOfSecondTokenDeposited: BigInt(rawEvent.amount_b),
    firstToken: doGetAssetData(assets, rawEvent.token_a),
    liquidityPoolAddress: rawEvent.pair,
    liquidityPoolTokensMinted: BigInt(rawEvent.liquidity),
    recipientAddress: rawEvent.to,
    secondToken: doGetAssetData(assets, rawEvent.token_b),
});

const parseRouterInitEvent = (rawEvent: RawRouterInitEvent): RouterInitializedEvent => ({
    ...parseCommonProperties(rawEvent),
    factoryAddress: rawEvent.factory,
});

const parseRouterRemoveLiquidityEvent = (
    rawEvent: RawRouterLiquidityEvent & { readonly topic2: "remove" },
    assets: readonly Asset[],
): RouterRemoveLiquidityEvent => ({
    ...parseCommonProperties(rawEvent),
    amountOfFirstTokenWithdrawn: BigInt(rawEvent.amount_a),
    amountOfSecondTokenWithdrawn: BigInt(rawEvent.amount_b),
    firstToken: doGetAssetData(assets, rawEvent.token_a),
    liquidityPoolAddress: rawEvent.pair,
    liquidityPoolTokensBurned: BigInt(rawEvent.liquidity),
    recipientAddress: rawEvent.to,
    secondToken: doGetAssetData(assets, rawEvent.token_b),
});

const parseRouterSwapEvent = (
    rawEvent: RawRouterSwapEvent,
    assets: readonly Asset[],
): RouterSwapEvent => ({
    ...parseCommonProperties(rawEvent),
    recipientAddress: rawEvent.to,
    tokenAmountsInSequence: rawEvent.amounts.map(BigInt),

    tradedTokenSequence: rawEvent.path.map((token) => doGetAssetData(assets, token)),
});

const parseRouterEvent = (assets: readonly Asset[], rawEvent: RawRouterEvent): RouterEvent => {
    switch (rawEvent.topic2) {
        case "add": {
            return parseRouterAddLiquidityEvent(
                rawEvent as RawRouterLiquidityEvent & { topic2: "add" },
                assets,
            );
        }
        case "init": {
            return parseRouterInitEvent(rawEvent);
        }
        case "remove": {
            return parseRouterRemoveLiquidityEvent(
                rawEvent as RawRouterLiquidityEvent & { topic2: "remove" },
                assets,
            );
        }
        case "swap": {
            return parseRouterSwapEvent(rawEvent, assets);
        }

        default: {
            throw new Error("Unknown SoroswapRouter event type.");
        }
    }
};

export { parseRouterEvent };
