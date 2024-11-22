// We disable this rule because we don't control the names of the events coming
// from the network.
/* eslint-disable @typescript-eslint/naming-convention */
import type { BaseEvent, BaseRawEvent, PairEventType } from "./events-common";
import type {
    RawTokenAdminEvent,
    RawTokenEvent,
    TokenAdminEvent,
    TokenEvent,
} from "./token-events";

interface BaseRawPairEvent extends BaseRawEvent {
    readonly topic1: "SoroswapPair";
    readonly topic2: PairEventType;
}

interface RawPairDepositEvent extends BaseRawPairEvent {
    readonly amount_0: string;
    readonly amount_1: string;
    readonly liquidity: string;
    readonly new_reserve_0: string;
    readonly new_reserve_1: string;
    readonly to: string;
    readonly topic2: "deposit";
}

interface RawPairSkimEvent extends BaseRawPairEvent {
    readonly skimmed_0: string;
    readonly skimmed_1: string;
    readonly topic2: "skim";
}

interface RawPairSwapEvent extends BaseRawPairEvent {
    readonly amount_0_in: string;
    readonly amount_0_out: string;
    readonly amount_1_in: string;
    readonly amount_1_out: string;
    readonly to: string;
    readonly topic2: "swap";
}

interface RawPairSyncEvent extends BaseRawPairEvent {
    readonly new_reserve_0: string;
    readonly new_reserve_1: string;
    readonly topic2: "sync";
}

interface RawPairWithdrawEvent extends BaseRawPairEvent {
    readonly amount_0: string;
    readonly amount_1: string;
    readonly liquidity: string;
    readonly new_reserve_0: string;
    readonly new_reserve_1: string;
    readonly to: string;
    readonly topic2: "withdraw";
}

type RawPairProperEvent =
    | RawPairDepositEvent
    | RawPairSkimEvent
    | RawPairSwapEvent
    | RawPairSyncEvent
    | RawPairWithdrawEvent;

type RawExtendedPairEvent = RawPairProperEvent | RawTokenEvent | RawTokenAdminEvent;

interface BasePairEvent extends BaseEvent {
    readonly contractType: "SoroswapPair";
    readonly eventType: PairEventType;
}

interface PairDepositEvent extends BasePairEvent {
    readonly amountOfFirstTokenDeposited: bigint;
    readonly amountOfSecondTokenDeposited: bigint;
    readonly eventType: "deposit";
    readonly liquidityPoolTokensMinted: bigint;
    readonly newReserveOfFirstToken: bigint;
    readonly newReserveOfSecondToken: bigint;
    readonly recipientAddress: string;
}

interface PairSkimEvent extends BasePairEvent {
    readonly amountOfFirstTokenSkimmed: bigint;
    readonly amountOfSecondTokenSkimmed: bigint;
    readonly eventType: "skim";
}

interface PairSwapEvent extends BasePairEvent {
    readonly amountOfFirstTokenIncoming: bigint;
    readonly amountOfFirstTokenOutgoing: bigint;
    readonly amountOfSecondTokenIncoming: bigint;
    readonly amountOfSecondTokenOutgoing: bigint;
    readonly eventType: "swap";
    readonly recipientAddress: string;
}

interface PairSyncEvent extends BasePairEvent {
    readonly eventType: "sync";
    readonly newReserveOfFirstToken: bigint;
    readonly newReserveOfSecondToken: bigint;
}

interface PairWithdrawEvent extends BasePairEvent {
    readonly amountOfFirstTokenWithdrawn: bigint;
    readonly amountOfSecondTokenWithdrawn: bigint;
    readonly eventType: "withdraw";
    readonly liquidityPoolTokensBurned: bigint;
    readonly newReserveOfFirstToken: bigint;
    readonly newReserveOfSecondToken: bigint;
    readonly recipientAddress: string;
}

type PairProperEvent =
    | PairDepositEvent
    | PairSkimEvent
    | PairSwapEvent
    | PairSyncEvent
    | PairWithdrawEvent;

type ExtendedPairEvent = PairProperEvent | TokenEvent | TokenAdminEvent;

export type {
    ExtendedPairEvent,
    PairDepositEvent,
    PairProperEvent,
    PairSkimEvent,
    PairSwapEvent,
    PairSyncEvent,
    PairWithdrawEvent,
    RawExtendedPairEvent,
    RawPairDepositEvent,
    RawPairProperEvent,
    RawPairSkimEvent,
    RawPairSwapEvent,
    RawPairSyncEvent,
    RawPairWithdrawEvent,
};
