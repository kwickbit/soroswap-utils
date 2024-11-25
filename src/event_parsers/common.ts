// We disable this rule because neither I nor Claude AI are smart enough to
// figure out how to make this work.
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import type { BaseEvent, BaseRawEvent, ContractType, EventType } from "../types";
import type { ExtendedTokenEventType, PairEventType } from "../types/events-common";

const parseCommonProperties = <
    SomeContractType extends ContractType,
    SomeEventType extends EventType,
>(
    rawEvent: BaseRawEvent,
): Pick<BaseEvent, "ledger" | "timestamp"> & {
    contractType: SomeContractType;
    eventType: SomeEventType;
} => ({
    contractType: rawEvent.topic1 as SomeContractType,
    eventType: rawEvent.topic2 as SomeEventType,
    ledger: rawEvent.ledger,
    timestamp: rawEvent.timestamp,
});

const parsePairProperties = <SomeEventType extends PairEventType>(
    rawEvent: BaseRawEvent & { readonly contractId: string; readonly topic1: "SoroswapPair" },
): Pick<BaseEvent, "ledger" | "timestamp"> & {
    contractId: string;
    contractType: "SoroswapPair";
    eventType: SomeEventType;
} => ({
    ...parseCommonProperties(rawEvent),
    contractId: rawEvent.contractId,
});

const parseTokenProperties = <SomeTokenType extends ExtendedTokenEventType>(
    rawEvent: BaseRawEvent & { readonly contractId: string },
): Pick<BaseEvent, "ledger" | "timestamp"> & {
    readonly contractId: string;
    readonly contractType: "SorobanToken";
    readonly eventType: SomeTokenType;
} => ({
    contractId: rawEvent.contractId,
    contractType: "SorobanToken" as const,
    eventType: rawEvent.topic1 as SomeTokenType,
    ledger: rawEvent.ledger,
    timestamp: rawEvent.timestamp,
});

export { parseCommonProperties, parsePairProperties, parseTokenProperties };
