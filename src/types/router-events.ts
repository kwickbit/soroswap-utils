// We disable this rule because we don't control the names of the events coming
// from the network.
/* eslint-disable @typescript-eslint/naming-convention */
import type { Asset } from "./assets";
import type { BaseEvent, BaseRawEvent, RouterEventType } from "./events-common";

interface BaseRawRouterEvent extends BaseRawEvent {
    readonly topic1: "SoroswapRouter";
    readonly topic2: RouterEventType;
    readonly topic3: never;
    readonly topic4: never;
}

interface RawRouterInitEvent extends BaseRawRouterEvent {
    readonly factory: string;
    readonly topic2: "init";
}

interface RawRouterLiquidityEvent extends BaseRawRouterEvent {
    readonly amount_a: string;
    readonly amount_b: string;
    readonly liquidity: string;
    readonly pair: string;
    readonly to: string;
    readonly token_a: string;
    readonly token_b: string;
    readonly topic2: "add" | "remove";
}

interface RawRouterSwapEvent extends BaseRawRouterEvent {
    readonly amounts: readonly string[];
    readonly path: readonly string[];
    readonly to: string;
    readonly topic2: "swap";
}

type RawRouterEvent = RawRouterInitEvent | RawRouterLiquidityEvent | RawRouterSwapEvent;

interface BaseRouterEvent extends BaseEvent {
    readonly contractType: "SoroswapRouter";
    readonly eventType: RouterEventType;
}

/**
 * Event emitted when the Router contract is initialized; it contains a
 * reference the Factory contract address creating it.
 */
interface RouterInitializedEvent extends BaseRouterEvent {
    readonly eventType: "init";
    readonly factoryAddress: string;
}

interface BaseLiquidityEvent extends BaseRouterEvent {
    readonly firstToken: Asset;
    readonly liquidityPoolAddress: string;
    readonly recipientAddress: string;
    readonly secondToken: Asset;
}

/**
 * Event emitted when liquidity is added to a pair through the Router.
 */
interface RouterAddLiquidityEvent extends BaseLiquidityEvent {
    readonly amountOfFirstTokenDeposited: bigint;
    readonly amountOfSecondTokenDeposited: bigint;
    readonly eventType: "add";
    readonly liquidityPoolTokensMinted: bigint;
}

/**
 * Event emitted when liquidity is removed from a pair through the Router.
 */
interface RouterRemoveLiquidityEvent extends BaseLiquidityEvent {
    readonly amountOfFirstTokenWithdrawn: bigint;
    readonly amountOfSecondTokenWithdrawn: bigint;
    readonly eventType: "remove";
    readonly liquidityPoolTokensBurned: bigint;
}

/**
 * Event emitted when a token swap is executed through the Router.
 * The path represents the sequence of tokens to swap through, where
 * consecutive tokens form the pairs to trade through.
 */
interface RouterSwapEvent extends BaseRouterEvent {
    readonly eventType: "swap";
    readonly recipientAddress: string;
    readonly tokenAmountsInSequence: readonly bigint[];
    readonly tradedTokenSequence: readonly Asset[];
}

type RouterEvent =
    | RouterAddLiquidityEvent
    | RouterInitializedEvent
    | RouterRemoveLiquidityEvent
    | RouterSwapEvent;

export type {
    RawRouterEvent,
    RawRouterInitEvent,
    RawRouterLiquidityEvent,
    RawRouterSwapEvent,
    RouterAddLiquidityEvent,
    RouterEvent,
    RouterInitializedEvent,
    RouterRemoveLiquidityEvent,
    RouterSwapEvent,
};
