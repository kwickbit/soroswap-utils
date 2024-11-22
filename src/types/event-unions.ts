import type { BaseRawFactoryEvent, FactoryEvent } from "./factory-events";
import type { ExtendedPairEvent, RawExtendedPairEvent } from "./pair-events";

type RawSoroswapEvent = BaseRawFactoryEvent | RawExtendedPairEvent;

type SoroswapEvent = FactoryEvent | ExtendedPairEvent;

export type { RawSoroswapEvent, SoroswapEvent };
