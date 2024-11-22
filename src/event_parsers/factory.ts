import { getAssetData } from "../assets";
import type {
    FactoryEvent,
    FactoryFeeDestinationAddressChangedEvent,
    FactoryFeesEnabledEvent,
    FactoryFeeSettingAddressChangedEvent,
    FactoryInitializedEvent,
    FactoryNewPairEvent,
    RawFactoryEvent,
    RawFactoryFeesEvent,
    RawFactoryFeeToEvent,
    RawFactoryInitEvent,
    RawFactoryNewPairEvent,
    RawFactorySetterEvent,
} from "../types";

const parseFactoryFeesEvent = (rawEvent: RawFactoryFeesEvent): FactoryFeesEnabledEvent => ({
    areFeesEnabledNow: rawEvent.fees_enabled,
    contractType: "SoroswapFactory",
    eventType: "fees",
    ledger: rawEvent.ledger,
    timestamp: rawEvent.timestamp,
});

const parseFactoryFeeToEvent = (
    rawEvent: RawFactoryFeeToEvent,
): FactoryFeeDestinationAddressChangedEvent => ({
    contractType: "SoroswapFactory",
    eventType: "fee_to",
    feeSettingAddress: rawEvent.setter,
    ledger: rawEvent.ledger,
    newFeeDestinationAddress: rawEvent.new,
    oldFeeDestinationAddress: rawEvent.old,
    timestamp: rawEvent.timestamp,
});

const parseFactoryInitEvent = (rawEvent: RawFactoryInitEvent): FactoryInitializedEvent => ({
    contractType: "SoroswapFactory",
    eventType: "init",
    feeSettingAddress: rawEvent.setter,
    ledger: rawEvent.ledger,
    timestamp: rawEvent.timestamp,
});

const parseFactoryNewPairEvent = async (
    rawEvent: RawFactoryNewPairEvent,
): Promise<FactoryNewPairEvent> => ({
    contractType: "SoroswapFactory",
    eventType: "new_pair",
    firstToken: await getAssetData(rawEvent.token_0),
    ledger: rawEvent.ledger,
    pairAddress: rawEvent.pair,
    pairIndex: rawEvent.new_pairs_length,
    secondToken: await getAssetData(rawEvent.token_1),
    timestamp: rawEvent.timestamp,
});

const parseFactorySetterEvent = (
    rawEvent: RawFactorySetterEvent,
): FactoryFeeSettingAddressChangedEvent => ({
    contractType: "SoroswapFactory",
    eventType: "setter",
    ledger: rawEvent.ledger,
    newfeeSettingAddress: rawEvent.new,
    oldfeeSettingAddress: rawEvent.old,
    timestamp: rawEvent.timestamp,
});

const parseFactoryEvent = async (rawEvent: RawFactoryEvent): Promise<FactoryEvent> => {
    switch (rawEvent.topic2) {
        case "fees": {
            return parseFactoryFeesEvent(rawEvent);
        }
        case "fee_to": {
            return parseFactoryFeeToEvent(rawEvent);
        }
        case "init": {
            return parseFactoryInitEvent(rawEvent);
        }
        case "new_pair": {
            return await parseFactoryNewPairEvent(rawEvent);
        }
        case "setter": {
            return parseFactorySetterEvent(rawEvent);
        }

        default: {
            // This should be unreachable, as the cases above are exhaustive.
            throw new Error("Unknown factory event type.");
        }
    }
};

export { parseFactoryEvent };
