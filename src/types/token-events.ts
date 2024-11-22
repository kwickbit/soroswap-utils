import type { BaseEvent, BaseRawEvent, TokenAdminEventType, TokenEventType } from "./events-common";

interface RawTokenEvent extends BaseRawEvent {
    readonly contractId: string;
    readonly topic1: TokenEventType;
    readonly topic2: string;
    readonly topic3: string;
    readonly topic4: string;
    readonly value: string;
}

interface BaseTokenEvent extends BaseEvent {
    readonly contractId: string;
    readonly contractType: "SorobanToken";
    readonly eventType: TokenEventType;
}

interface TokenApproveEvent extends BaseTokenEvent {
    readonly amount: bigint;
    readonly eventType: "approve";
    readonly expirationLedger: number;
    readonly ownerAddress: string;
    readonly spenderAddress: string;
}

interface TokenBurnEvent extends BaseTokenEvent {
    readonly amount: bigint;
    readonly eventType: "burn";
    readonly ownerAddress: string;
}

interface TokenTransferEvent extends BaseTokenEvent {
    readonly amount: bigint;
    readonly eventType: "transfer";
    readonly recipientAddress: string;
    readonly senderAddress: string;
}

type TokenEvent = TokenApproveEvent | TokenBurnEvent | TokenTransferEvent;

interface RawTokenAdminEvent extends BaseRawEvent {
    readonly contractId: string;
    readonly topic1: TokenAdminEventType;
    readonly topic2: string;
    readonly topic3: string;
    readonly topic4: string;
    readonly value: string;
}

interface BaseTokenAdminEvent extends BaseEvent {
    readonly contractId: string;
    readonly contractType: "SorobanToken";
    readonly eventType: TokenAdminEventType;
}

interface TokenClawbackEvent extends BaseTokenAdminEvent {
    readonly adminAddress: string;
    readonly amount: bigint;
    readonly eventType: "clawback";
    readonly targetAddress: string;
}

interface TokenMintEvent extends BaseTokenAdminEvent {
    readonly adminAddress: string;
    readonly amount: bigint;
    readonly eventType: "mint";
    readonly recipientAddress: string;
}

interface TokenSetAdminEvent extends BaseTokenAdminEvent {
    readonly adminAddress: string;
    readonly eventType: "set_admin";
    readonly newAdminAddress: string;
}

interface TokenSetAuthorizedEvent extends BaseTokenAdminEvent {
    readonly adminAddress: string;
    readonly eventType: "set_authorized";
    readonly isAuthorized: boolean;
    readonly targetAddress: string;
}

type TokenAdminEvent =
    | TokenClawbackEvent
    | TokenMintEvent
    | TokenSetAdminEvent
    | TokenSetAuthorizedEvent;

export type {
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
};
