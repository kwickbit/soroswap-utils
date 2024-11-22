import type { FactoryEvent, RawFactoryEvent } from "./factory-events";
import type { ExtendedPairEvent, RawExtendedPairEvent } from "./pair-events";
import type { RawRouterEvent, RouterEvent } from "./router-events";

type RawSoroswapEvent = RawExtendedPairEvent | RawFactoryEvent | RawRouterEvent;

type SoroswapEvent = ExtendedPairEvent | FactoryEvent | RouterEvent;

export type { RawSoroswapEvent, SoroswapEvent };
