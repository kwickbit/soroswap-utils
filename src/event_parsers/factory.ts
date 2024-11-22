import { getAssetData } from "../assets";
import type {
    FactoryEvent,
    FactoryFeeDestinationAddressChangedEvent,
    FactoryFeesEnabledEvent,
    FactoryFeeSettingAddressChangedEvent,
    FactoryInitializedEvent,
    FactoryNewPairEvent,
    RawFactoryEvent,
} from "../types";

const parseFactoryFeesEvent = (rawEvent: RawFactoryEvent): FactoryFeesEnabledEvent => ({
    areFeesEnabledNow: rawEvent.fees_enabled as boolean,
    contractType: "SoroswapFactory",
    eventType: "fees",
    ledger: rawEvent.ledger,
    timestamp: rawEvent.timestamp,
});

const parseFactoryFeeToEvent = (
    rawEvent: RawFactoryEvent,
): FactoryFeeDestinationAddressChangedEvent => ({
    contractType: "SoroswapFactory",
    eventType: "fee_to",
    feeSettingAddress: rawEvent.setter as string,
    ledger: rawEvent.ledger,
    newFeeDestinationAddress: rawEvent.new as string,
    oldFeeDestinationAddress: rawEvent.old as string,
    timestamp: rawEvent.timestamp,
});

const parseFactoryInitEvent = (rawEvent: RawFactoryEvent): FactoryInitializedEvent => ({
    contractType: "SoroswapFactory",
    eventType: "init",
    feeSettingAddress: rawEvent.setter as string,
    ledger: rawEvent.ledger,
    timestamp: rawEvent.timestamp,
});

const parseFactoryNewPairEvent = async (
    rawEvent: RawFactoryEvent,
): Promise<FactoryNewPairEvent> => ({
    contractType: "SoroswapFactory",
    eventType: "new_pair",
    firstToken: await getAssetData(rawEvent.token_0 as string),
    ledger: rawEvent.ledger,
    pairAddress: rawEvent.pair as string,
    pairIndex: rawEvent.new_pairs_length as number,
    secondToken: await getAssetData(rawEvent.token_1 as string),
    timestamp: rawEvent.timestamp,
});

const parseFactorySetterEvent = (
    rawEvent: RawFactoryEvent,
): FactoryFeeSettingAddressChangedEvent => ({
    contractType: "SoroswapFactory",
    eventType: "setter",
    ledger: rawEvent.ledger,
    newfeeSettingAddress: rawEvent.new as string,
    oldfeeSettingAddress: rawEvent.old as string,
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
