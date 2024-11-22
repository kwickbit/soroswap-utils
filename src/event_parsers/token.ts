import type {
    RawTokenAdminEvent,
    RawTokenEvent,
    TokenApproveEvent,
    TokenBurnEvent,
    TokenClawbackEvent,
    TokenMintEvent,
    TokenSetAdminEvent,
    TokenSetAuthorizedEvent,
    TokenTransferEvent,
} from "../types";

const parseTokenApproveEvent = (rawEvent: RawTokenEvent): TokenApproveEvent => ({
    amount: BigInt(rawEvent.value),
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
    contractType: "SorobanToken",
    eventType: "burn",
    ledger: rawEvent.ledger,
    ownerAddress: rawEvent.topic2,
    timestamp: rawEvent.timestamp,
});

const parseTokenClawbackEvent = (rawEvent: RawTokenAdminEvent): TokenClawbackEvent => ({
    adminAddress: rawEvent.topic2,
    amount: BigInt(rawEvent.value),
    contractType: "SorobanToken",
    eventType: "clawback",
    ledger: rawEvent.ledger,
    targetAddress: rawEvent.topic3,
    timestamp: rawEvent.timestamp,
});

const parseTokenMintEvent = (rawEvent: RawTokenAdminEvent): TokenMintEvent => ({
    adminAddress: rawEvent.topic2,
    amount: BigInt(rawEvent.value),
    contractType: "SorobanToken",
    eventType: "mint",
    ledger: rawEvent.ledger,
    recipientAddress: rawEvent.topic3,
    timestamp: rawEvent.timestamp,
});

const parseTokenSetAdminEvent = (rawEvent: RawTokenAdminEvent): TokenSetAdminEvent => ({
    adminAddress: rawEvent.topic2,
    contractType: "SorobanToken",
    eventType: "set_admin",
    ledger: rawEvent.ledger,
    newAdminAddress: rawEvent.value,
    timestamp: rawEvent.timestamp,
});

const parseTokenSetAuthorizedEvent = (rawEvent: RawTokenAdminEvent): TokenSetAuthorizedEvent => ({
    adminAddress: rawEvent.topic2,
    contractType: "SorobanToken",
    eventType: "set_authorized",
    isAuthorized: Boolean(rawEvent.value),
    ledger: rawEvent.ledger,
    targetAddress: rawEvent.topic3,
    timestamp: rawEvent.timestamp,
});

const parseTokenTransferEvent = (rawEvent: RawTokenEvent): TokenTransferEvent => ({
    amount: BigInt(rawEvent.value),
    contractType: "SorobanToken",
    eventType: "transfer",
    ledger: rawEvent.ledger,
    recipientAddress: rawEvent.topic3,
    senderAddress: rawEvent.topic2,
    timestamp: rawEvent.timestamp,
});

export {
    parseTokenApproveEvent,
    parseTokenBurnEvent,
    parseTokenClawbackEvent,
    parseTokenMintEvent,
    parseTokenSetAdminEvent,
    parseTokenSetAuthorizedEvent,
    parseTokenTransferEvent,
};
