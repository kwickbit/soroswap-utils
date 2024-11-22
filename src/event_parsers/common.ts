import type { BaseEvent, BaseRawEvent, ContractType } from "../types";

const parseCommonProperties = <SomeContractType extends ContractType>(
    rawEvent: BaseRawEvent,
    contractType: SomeContractType,
): Pick<BaseEvent, "contractType" | "ledger" | "timestamp"> & {
    contractType: SomeContractType;
} => ({
    contractType,
    ledger: rawEvent.ledger,
    timestamp: rawEvent.timestamp,
});

const parsePairProperties = <SomeContractType extends ContractType>(
    rawEvent: BaseRawEvent & { readonly contractId: string },
    contractType: SomeContractType,
): Pick<BaseEvent, "contractType" | "ledger" | "timestamp"> & {
    contractId: string;
    contractType: SomeContractType;
} => ({
    ...parseCommonProperties(rawEvent, contractType),
    contractId: rawEvent.contractId,
});

export { parseCommonProperties, parsePairProperties };
