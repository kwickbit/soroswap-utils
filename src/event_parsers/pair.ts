import type {
    ExtendedPairEvent,
    ExtendedTokenEventType,
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
} from "../types";
import { parsePairProperties } from "./common";
import { parseSorobanTokenEvent } from "./token";

const parsePairDepositEvent = (rawEvent: RawPairDepositEvent): PairDepositEvent => ({
    ...parsePairProperties(rawEvent),
    amountOfFirstTokenDeposited: BigInt(rawEvent.amount_0),
    amountOfSecondTokenDeposited: BigInt(rawEvent.amount_1),
    liquidityPoolTokensMinted: BigInt(rawEvent.liquidity),
    newReserveOfFirstToken: BigInt(rawEvent.new_reserve_0),
    newReserveOfSecondToken: BigInt(rawEvent.new_reserve_1),
    recipientAddress: rawEvent.to,
});

const parsePairSwapEvent = (rawEvent: RawPairSwapEvent): PairSwapEvent => ({
    ...parsePairProperties(rawEvent),
    amountOfFirstTokenIncoming: BigInt(rawEvent.amount_0_in),
    amountOfFirstTokenOutgoing: BigInt(rawEvent.amount_0_out),
    amountOfSecondTokenIncoming: BigInt(rawEvent.amount_1_in),
    amountOfSecondTokenOutgoing: BigInt(rawEvent.amount_1_out),
    recipientAddress: rawEvent.to,
});

const parsePairSyncEvent = (rawEvent: RawPairSyncEvent): PairSyncEvent => ({
    ...parsePairProperties(rawEvent),
    newReserveOfFirstToken: BigInt(rawEvent.new_reserve_0),
    newReserveOfSecondToken: BigInt(rawEvent.new_reserve_1),
});

const parsePairSkimEvent = (rawEvent: RawPairSkimEvent): PairSkimEvent => ({
    ...parsePairProperties(rawEvent),
    amountOfFirstTokenSkimmed: BigInt(rawEvent.skimmed_0),
    amountOfSecondTokenSkimmed: BigInt(rawEvent.skimmed_1),
});

const parsePairWithdrawEvent = (rawEvent: RawPairWithdrawEvent): PairWithdrawEvent => ({
    ...parsePairProperties(rawEvent),
    amountOfFirstTokenWithdrawn: BigInt(rawEvent.amount_0),
    amountOfSecondTokenWithdrawn: BigInt(rawEvent.amount_1),
    liquidityPoolTokensBurned: BigInt(rawEvent.liquidity),
    newReserveOfFirstToken: BigInt(rawEvent.new_reserve_0),
    newReserveOfSecondToken: BigInt(rawEvent.new_reserve_1),
    recipientAddress: rawEvent.to,
});

const parseSoroswapPairEvent = (rawEvent: RawPairProperEvent): PairProperEvent => {
    // SoroswapPair events "proper" have topic2 as the event type.
    // We handle separately events that implement the SorobanToken interface;
    // those have topic1 as the event type.
    switch (rawEvent.topic2) {
        case "deposit": {
            return parsePairDepositEvent(rawEvent);
        }
        case "swap": {
            return parsePairSwapEvent(rawEvent);
        }
        case "sync": {
            return parsePairSyncEvent(rawEvent);
        }
        case "skim": {
            return parsePairSkimEvent(rawEvent);
        }
        case "withdraw": {
            return parsePairWithdrawEvent(rawEvent);
        }

        default: {
            // This should be unreachable, as the cases above are exhaustive.
            throw new Error("Unknown SoroswapPair event type.");
        }
    }
};

const parsePairEvent = (rawEvent: RawExtendedPairEvent): ExtendedPairEvent => {
    if (rawEvent.topic1 === "SoroswapPair") {
        return parseSoroswapPairEvent(rawEvent);
    }

    if (
        (
            [
                "approve",
                "burn",
                "clawback",
                "mint",
                "set_admin",
                "set_authorized",
                "transfer",
            ] as const satisfies readonly ExtendedTokenEventType[]
        ).includes(rawEvent.topic1)
    ) {
        return parseSorobanTokenEvent(rawEvent);
    }

    // This should be unreachable, as the cases above are exhaustive.
    throw new Error(`Unknown event type: ${rawEvent.topic1}/${rawEvent.topic2}`);
};

export { parsePairEvent };
