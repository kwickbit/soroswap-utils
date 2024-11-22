import { getAssetData } from "../assets";
import type {
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

const parseRouterAddLiquidityEvent = async (
    rawEvent: RawRouterLiquidityEvent & { readonly topic2: "add" },
): Promise<RouterAddLiquidityEvent> => ({
    ...parseCommonProperties(rawEvent, "SoroswapRouter"),
    amountOfFirstTokenDeposited: BigInt(rawEvent.amount_a),
    amountOfSecondTokenDeposited: BigInt(rawEvent.amount_b),
    eventType: "add",
    firstToken: await getAssetData(rawEvent.token_a),
    liquidityPoolAddress: rawEvent.pair,
    liquidityPoolTokensMinted: BigInt(rawEvent.liquidity),
    recipientAddress: rawEvent.to,
    secondToken: await getAssetData(rawEvent.token_b),
});

const parseRouterInitEvent = (rawEvent: RawRouterInitEvent): RouterInitializedEvent => ({
    ...parseCommonProperties(rawEvent, "SoroswapRouter"),
    eventType: "init",
    factoryAddress: rawEvent.factory,
});

const parseRouterRemoveLiquidityEvent = async (
    rawEvent: RawRouterLiquidityEvent & { readonly topic2: "remove" },
): Promise<RouterRemoveLiquidityEvent> => ({
    ...parseCommonProperties(rawEvent, "SoroswapRouter"),
    amountOfFirstTokenWithdrawn: BigInt(rawEvent.amount_a),
    amountOfSecondTokenWithdrawn: BigInt(rawEvent.amount_b),
    eventType: "remove",
    firstToken: await getAssetData(rawEvent.token_a),
    liquidityPoolAddress: rawEvent.pair,
    liquidityPoolTokensBurned: BigInt(rawEvent.liquidity),
    recipientAddress: rawEvent.to,
    secondToken: await getAssetData(rawEvent.token_b),
});

const parseRouterSwapEvent = async (rawEvent: RawRouterSwapEvent): Promise<RouterSwapEvent> => ({
    ...parseCommonProperties(rawEvent, "SoroswapRouter"),
    eventType: "swap",
    recipientAddress: rawEvent.to,
    tokenAmountsInSequence: rawEvent.amounts.map(BigInt),
    tradedTokenSequence: await Promise.all(rawEvent.path.map(getAssetData)),
});

const parseRouterEvent = async (rawEvent: RawRouterEvent): Promise<RouterEvent> => {
    switch (rawEvent.topic2) {
        case "add": {
            return await parseRouterAddLiquidityEvent(
                rawEvent as RawRouterLiquidityEvent & { topic2: "add" },
            );
        }
        case "init": {
            return parseRouterInitEvent(rawEvent);
        }
        case "remove": {
            return await parseRouterRemoveLiquidityEvent(
                rawEvent as RawRouterLiquidityEvent & { topic2: "remove" },
            );
        }
        case "swap": {
            return await parseRouterSwapEvent(rawEvent);
        }

        default: {
            throw new Error("Unknown SoroswapRouter event type.");
        }
    }
};

export { parseRouterEvent };
