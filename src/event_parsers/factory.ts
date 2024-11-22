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
import { parseCommonProperties } from "./common";

const parseFactoryFeesEvent = (rawEvent: RawFactoryFeesEvent): FactoryFeesEnabledEvent => ({
    ...parseCommonProperties(rawEvent, "SoroswapFactory"),
    areFeesEnabledNow: rawEvent.fees_enabled,
    eventType: "fees",
});

const parseFactoryFeeToEvent = (
    rawEvent: RawFactoryFeeToEvent,
): FactoryFeeDestinationAddressChangedEvent => ({
    ...parseCommonProperties(rawEvent, "SoroswapFactory"),
    eventType: "fee_to",
    feeSettingAddress: rawEvent.setter,
    newFeeDestinationAddress: rawEvent.new,
    oldFeeDestinationAddress: rawEvent.old,
});

const parseFactoryInitEvent = (rawEvent: RawFactoryInitEvent): FactoryInitializedEvent => ({
    ...parseCommonProperties(rawEvent, "SoroswapFactory"),
    eventType: "init",
    feeSettingAddress: rawEvent.setter,
});

const parseFactoryNewPairEvent = async (
    rawEvent: RawFactoryNewPairEvent,
): Promise<FactoryNewPairEvent> => ({
    ...parseCommonProperties(rawEvent, "SoroswapFactory"),
    eventType: "new_pair",
    firstToken: await getAssetData(rawEvent.token_0),
    pairAddress: rawEvent.pair,
    pairIndex: rawEvent.new_pairs_length,
    secondToken: await getAssetData(rawEvent.token_1),
});

const parseFactorySetterEvent = (
    rawEvent: RawFactorySetterEvent,
): FactoryFeeSettingAddressChangedEvent => ({
    ...parseCommonProperties(rawEvent, "SoroswapFactory"),
    eventType: "setter",
    newfeeSettingAddress: rawEvent.new,
    oldfeeSettingAddress: rawEvent.old,
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
