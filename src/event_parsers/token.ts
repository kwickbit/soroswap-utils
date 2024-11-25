import type {
    RawTokenAdminEvent,
    RawTokenEvent,
    TokenAdminEvent,
    TokenApproveEvent,
    TokenBurnEvent,
    TokenClawbackEvent,
    TokenEvent,
    TokenMintEvent,
    TokenSetAdminEvent,
    TokenSetAuthorizedEvent,
    TokenTransferEvent,
} from "../types";
import { parseTokenProperties } from "./common";

const parseTokenApproveEvent = (rawEvent: RawTokenEvent): TokenApproveEvent => ({
    ...parseTokenProperties(rawEvent),
    amount: BigInt(rawEvent.value),
    expirationLedger: Number(rawEvent.value),
    ownerAddress: rawEvent.topic2,
    spenderAddress: rawEvent.topic3,
});

const parseTokenBurnEvent = (rawEvent: RawTokenEvent): TokenBurnEvent => ({
    ...parseTokenProperties(rawEvent),
    amount: BigInt(rawEvent.value),
    ownerAddress: rawEvent.topic2,
});

const parseTokenClawbackEvent = (rawEvent: RawTokenAdminEvent): TokenClawbackEvent => ({
    ...parseTokenProperties(rawEvent),
    adminAddress: rawEvent.topic2,
    amount: BigInt(rawEvent.value),
    targetAddress: rawEvent.topic3,
});

const parseTokenMintEvent = (rawEvent: RawTokenAdminEvent): TokenMintEvent => ({
    ...parseTokenProperties(rawEvent),
    adminAddress: rawEvent.topic2,
    amount: BigInt(rawEvent.value),
    recipientAddress: rawEvent.topic3,
});

const parseTokenSetAdminEvent = (rawEvent: RawTokenAdminEvent): TokenSetAdminEvent => ({
    ...parseTokenProperties(rawEvent),
    adminAddress: rawEvent.topic2,
    newAdminAddress: rawEvent.value,
});

const parseTokenSetAuthorizedEvent = (rawEvent: RawTokenAdminEvent): TokenSetAuthorizedEvent => ({
    ...parseTokenProperties(rawEvent),
    adminAddress: rawEvent.topic2,
    isAuthorized: Boolean(rawEvent.value),
    targetAddress: rawEvent.topic3,
});

const parseTokenTransferEvent = (rawEvent: RawTokenEvent): TokenTransferEvent => ({
    ...parseTokenProperties(rawEvent),
    amount: BigInt(rawEvent.value),
    recipientAddress: rawEvent.topic3,
    senderAddress: rawEvent.topic2,
});

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
            // This should be unreachable, as the cases above are exhaustive.
            throw new Error("Unknown token event type.");
        }
    }
};

export { parseSorobanTokenEvent };
