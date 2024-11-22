import type {
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
    RawTokenAdminEvent,
    RawTokenEvent,
    TokenAdminEvent,
    TokenEvent,
} from "../types";
import { parsePairProperties } from "./common";
import {
    parseTokenApproveEvent,
    parseTokenBurnEvent,
    parseTokenClawbackEvent,
    parseTokenMintEvent,
    parseTokenSetAdminEvent,
    parseTokenSetAuthorizedEvent,
    parseTokenTransferEvent,
} from "./token";

const parsePairDepositEvent = (rawEvent: RawPairDepositEvent): PairDepositEvent => ({
    ...parsePairProperties(rawEvent, "SoroswapPair"),
    amountOfFirstTokenDeposited: BigInt(rawEvent.amount_0),
    amountOfSecondTokenDeposited: BigInt(rawEvent.amount_1),
    eventType: "deposit",
    liquidityPoolTokensMinted: BigInt(rawEvent.liquidity),
    newReserveOfFirstToken: BigInt(rawEvent.new_reserve_0),
    newReserveOfSecondToken: BigInt(rawEvent.new_reserve_1),
    recipientAddress: rawEvent.to,
});

const parsePairSwapEvent = (rawEvent: RawPairSwapEvent): PairSwapEvent => ({
    ...parsePairProperties(rawEvent, "SoroswapPair"),
    amountOfFirstTokenIncoming: BigInt(rawEvent.amount_0_in),
    amountOfFirstTokenOutgoing: BigInt(rawEvent.amount_0_out),
    amountOfSecondTokenIncoming: BigInt(rawEvent.amount_1_in),
    amountOfSecondTokenOutgoing: BigInt(rawEvent.amount_1_out),
    eventType: "swap",
    recipientAddress: rawEvent.to,
});

const parsePairSyncEvent = (rawEvent: RawPairSyncEvent): PairSyncEvent => ({
    ...parsePairProperties(rawEvent, "SoroswapPair"),
    eventType: "sync",
    newReserveOfFirstToken: BigInt(rawEvent.new_reserve_0),
    newReserveOfSecondToken: BigInt(rawEvent.new_reserve_1),
});

const parsePairSkimEvent = (rawEvent: RawPairSkimEvent): PairSkimEvent => ({
    ...parsePairProperties(rawEvent, "SoroswapPair"),
    amountOfFirstTokenSkimmed: BigInt(rawEvent.skimmed_0),
    amountOfSecondTokenSkimmed: BigInt(rawEvent.skimmed_1),
    eventType: "skim",
});

const parsePairWithdrawEvent = (rawEvent: RawPairWithdrawEvent): PairWithdrawEvent => ({
    ...parsePairProperties(rawEvent, "SoroswapPair"),
    amountOfFirstTokenWithdrawn: BigInt(rawEvent.amount_0),
    amountOfSecondTokenWithdrawn: BigInt(rawEvent.amount_1),
    eventType: "withdraw",
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
            throw new Error("Unknown SoroswapPair event type.");
        }
    }
};

const parseSorobanTokenEvent = (
    rawEvent: RawTokenEvent | RawTokenAdminEvent,
): TokenEvent | TokenAdminEvent => {
    // These are emitted by SoroswapPair contracts but their shape is determined
    // by the SorobanToken interface, with topic1 as the event type.
    switch (rawEvent.topic1) {
        case "approve": {
            return parseTokenApproveEvent(rawEvent);
        }
        case "burn": {
            return parseTokenBurnEvent(rawEvent);
        }
        case "clawback": {
            return parseTokenClawbackEvent(rawEvent);
        }
        case "mint": {
            return parseTokenMintEvent(rawEvent);
        }
        case "set_admin": {
            return parseTokenSetAdminEvent(rawEvent);
        }
        case "set_authorized": {
            return parseTokenSetAuthorizedEvent(rawEvent);
        }
        case "transfer": {
            return parseTokenTransferEvent(rawEvent);
        }

        default: {
            throw new Error("Unknown token event type.");
        }
    }
};

const parsePairEvent = (rawEvent: RawExtendedPairEvent): ExtendedPairEvent => {
    if (rawEvent.topic1 === "SoroswapPair") {
        return parseSoroswapPairEvent(rawEvent);
    }

    if (
        ["approve", "burn", "clawback", "mint", "set_admin", "set_authorized", "transfer"].includes(
            rawEvent.topic1,
        )
    ) {
        return parseSorobanTokenEvent(rawEvent);
    }

    throw new Error(`Unknown event type: ${rawEvent.topic1}/${rawEvent.topic2}`);
};

export { parsePairEvent };
