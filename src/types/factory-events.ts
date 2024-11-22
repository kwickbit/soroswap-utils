/**
 * @module
 * Events emitted by Soroswap contracts. For all events:
 * - contractType corresponds to the on-chain event's topic1
 * - eventType corresponds to the on-chain event's topic2
 * - ledger and timestamp come from the chain itself
 */

import type { Asset } from "./assets";
import type { BaseEvent, BaseRawEvent, FactoryEventType } from "./events-common";

/**
 * Input type to the factory event parser.
 */
interface RawFactoryEvent extends BaseRawEvent {
    readonly [key: string]: unknown;
    readonly topic1: "SoroswapFactory";
    readonly topic2: FactoryEventType;
    readonly topic3: never;
    readonly topic4: never;
}

interface BaseFactoryEvent extends BaseEvent {
    readonly contractType: "SoroswapFactory";
    readonly eventType: FactoryEventType;
}

/**
 * Event emitted when the fee recipient address is changed. The event reports
 * who changed the address, what it was and what it was changed to.
 */
interface FactoryFeeDestinationAddressChangedEvent extends BaseFactoryEvent {
    readonly eventType: "fee_to";
    readonly feeSettingAddress: string;
    readonly newFeeDestinationAddress: string;
    readonly oldFeeDestinationAddress: string;
}

/**
 * Event emitted when fee collection is enabled/disabled. The event reports
 * the new state.
 */
interface FactoryFeesEnabledEvent extends BaseFactoryEvent {
    readonly areFeesEnabledNow: boolean;
    readonly eventType: "fees";
}

/**
 * Event emitted when the fee setter address is changed. The event reports
 * which address the ability to change the fees was granted to as well as who
 * had it.
 */
interface FactoryFeeSettingAddressChangedEvent extends BaseFactoryEvent {
    readonly eventType: "setter";
    readonly newfeeSettingAddress: string;
    readonly oldfeeSettingAddress: string;
}

// Types related to "new_pair" events

interface BaseFactoryNewPairEvent extends BaseFactoryEvent {
    readonly eventType: "new_pair";
    readonly pairAddress: string;
    readonly pairIndex: number;
}

interface MainnetFactoryNewPairEvent extends BaseFactoryNewPairEvent {
    readonly firstToken: Asset;
    readonly secondToken: Asset;
}

interface TestnetFactoryNewPairEvent extends BaseFactoryNewPairEvent {
    readonly firstToken?: Asset;
    readonly secondToken?: Asset;
}

/**
 * Event emitted by the Soroswap Factory contract when it is initialized. The
 * setter address identifies the account that is authorized to enable/disable
 * fees and set the fee recipient address.
 */
interface FactoryInitializedEvent extends BaseFactoryEvent {
    readonly eventType: "init";
    readonly feeSettingAddress: string;
}

/**
 * Event emitted by the Soroswap Factory contract when a new pair is created.
 * The tokens are enriched with their details like asset code and issuer. The
 * pairIndex is based on how many pairs have been created so far, and the
 * pairAddress is the address of the pair being created.
 */
type FactoryNewPairEvent = MainnetFactoryNewPairEvent | TestnetFactoryNewPairEvent;

type FactoryEvent =
    | FactoryFeeDestinationAddressChangedEvent
    | FactoryFeesEnabledEvent
    | FactoryFeeSettingAddressChangedEvent
    | FactoryInitializedEvent
    | FactoryNewPairEvent;

export type {
    FactoryEvent,
    FactoryFeeDestinationAddressChangedEvent,
    FactoryFeesEnabledEvent,
    FactoryFeeSettingAddressChangedEvent,
    FactoryInitializedEvent,
    FactoryNewPairEvent,
    RawFactoryEvent,
};