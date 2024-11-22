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

const parseTokenApproveEvent = (rawEvent: RawTokenEvent): TokenApproveEvent => ({
    amount: BigInt(rawEvent.value),
    contractId: rawEvent.contractId,
    contractType: "SorobanToken",
    eventType: "approve",
    expirationLedger: Number(rawEvent.value),
    ledger: rawEvent.ledger,
    ownerAddress: rawEvent.topic2,
    spenderAddress: rawEvent.topic3,
    timestamp: rawEvent.timestamp,
});

const parseTokenBurnEvent = (rawEvent: RawTokenEvent): TokenBurnEvent => ({
    amount: BigInt(rawEvent.value),
    contractId: rawEvent.contractId,
    contractType: "SorobanToken",
    eventType: "burn",
    ledger: rawEvent.ledger,
    ownerAddress: rawEvent.topic2,
    timestamp: rawEvent.timestamp,
});

const parseTokenClawbackEvent = (rawEvent: RawTokenAdminEvent): TokenClawbackEvent => ({
    adminAddress: rawEvent.topic2,
    amount: BigInt(rawEvent.value),
    contractId: rawEvent.contractId,
    contractType: "SorobanToken",
    eventType: "clawback",
    ledger: rawEvent.ledger,
    targetAddress: rawEvent.topic3,
    timestamp: rawEvent.timestamp,
});

const parseTokenMintEvent = (rawEvent: RawTokenAdminEvent): TokenMintEvent => ({
    adminAddress: rawEvent.topic2,
    amount: BigInt(rawEvent.value),
    contractId: rawEvent.contractId,
    contractType: "SorobanToken",
    eventType: "mint",
    ledger: rawEvent.ledger,
    recipientAddress: rawEvent.topic3,
    timestamp: rawEvent.timestamp,
});

const parseTokenSetAdminEvent = (rawEvent: RawTokenAdminEvent): TokenSetAdminEvent => ({
    adminAddress: rawEvent.topic2,
    contractId: rawEvent.contractId,
    contractType: "SorobanToken",
    eventType: "set_admin",
    ledger: rawEvent.ledger,
    newAdminAddress: rawEvent.value,
    timestamp: rawEvent.timestamp,
});

const parseTokenSetAuthorizedEvent = (rawEvent: RawTokenAdminEvent): TokenSetAuthorizedEvent => ({
    adminAddress: rawEvent.topic2,
    contractId: rawEvent.contractId,
    contractType: "SorobanToken",
    eventType: "set_authorized",
    isAuthorized: Boolean(rawEvent.value),
    ledger: rawEvent.ledger,
    targetAddress: rawEvent.topic3,
    timestamp: rawEvent.timestamp,
});

const parseTokenTransferEvent = (rawEvent: RawTokenEvent): TokenTransferEvent => ({
    amount: BigInt(rawEvent.value),
    contractId: rawEvent.contractId,
    contractType: "SorobanToken",
    eventType: "transfer",
    ledger: rawEvent.ledger,
    recipientAddress: rawEvent.topic3,
    senderAddress: rawEvent.topic2,
    timestamp: rawEvent.timestamp,
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
