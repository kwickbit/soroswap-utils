type FactoryEventType = "fees" | "fee_to" | "init" | "new_pair" | "setter";

type PairEventType = "deposit" | "skim" | "swap" | "sync" | "withdraw";

type TokenAdminEventType = "clawback" | "mint" | "set_admin" | "set_authorized";

type TokenEventType = "approve" | "burn" | "transfer";

type EventType = FactoryEventType | PairEventType | TokenAdminEventType | TokenEventType;

type ContractType = "SoroswapFactory" | "SoroswapPair" | "SoroswapRouter" | "SorobanToken";

interface BaseRawEvent {
    readonly ledger: number;
    readonly timestamp: number;
    readonly topic1: string;
    readonly topic2: string;
    readonly topic3: string;
    readonly topic4: string;
}

interface BaseEvent {
    readonly contractType: ContractType;
    readonly eventType: EventType;
    readonly ledger: number;
    readonly timestamp: number;
}

export type {
    BaseEvent,
    BaseRawEvent,
    ContractType,
    FactoryEventType,
    PairEventType,
    TokenAdminEventType,
    TokenEventType,
};
