import type { DetailedAsset, TestnetAsset } from "./assets";

type Asset = DetailedAsset | TestnetAsset;

interface BaseEvent {
    readonly ledger: number;
    readonly timestamp: number;
}

interface BaseFactoryNewPairEvent extends BaseEvent {
    readonly contractType: "SoroswapFactory";
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
 * Event emitted by the Soroswap Factory contract upon creation of a new pair.
 * The contractType and eventType are the `topic1` and `topic2` properties from
 * the on-chain event, respectively. The tokens are enriched with their details
 * like asset code and issuer. The pairIndex is based on how many pairs have
 * been created so far, and the pairAddress is the address of the pair being
 * created.
 */
type FactoryNewPairEvent = MainnetFactoryNewPairEvent | TestnetFactoryNewPairEvent;

export type { Asset, FactoryNewPairEvent };
