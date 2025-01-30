interface UncertifiedAsset {
    readonly contract: string;
    readonly isSoroswapCertified: false;
}
interface SimpleAsset {
    readonly code: string;
    readonly contract: string;
    readonly isSoroswapCertified: boolean;
    readonly issuer: string;
}
interface TestnetAsset extends SimpleAsset {
    readonly decimals: number;
    readonly icon: string;
    readonly name: string;
}
interface DetailedAsset extends TestnetAsset {
    readonly domain: string;
    readonly org: string;
}
type Asset = DetailedAsset | TestnetAsset | UncertifiedAsset;
interface TestnetData {
    readonly assets: readonly TestnetAsset[];
    readonly network: "mainnet" | "testnet" | "standalone";
}
type TestnetResponse = readonly TestnetData[];
interface MainnetResponse {
    readonly assets: readonly DetailedAsset[];
    readonly description: string;
    readonly feedback: string;
    readonly name: string;
    readonly network: string;
    readonly provider: string;
    readonly version: string;
}
type AssetData = MainnetResponse | TestnetData;
interface CacheEntry {
    readonly data: AssetData;
    readonly timestamp: number;
}
interface PoolData {
    constantProductOfReserves: number;
    firstToken: Asset;
    readonly poolContract: string;
    reserves: readonly [number, number];
    secondToken: Asset;
}

type SoroswapFactoryContract = "SoroswapFactory" | "factory";
type SoroswapRouterContract = "SoroswapRouter" | "router";
type SoroswapPairContract = {
    readonly pair: readonly string[];
    readonly SoroswapPair?: never;
} | {
    readonly pair?: never;
    readonly SoroswapPair: readonly string[];
};
type SoroswapContract = SoroswapFactoryContract | SoroswapRouterContract | SoroswapPairContract;

type FactoryEventType = "fees" | "fee_to" | "init" | "new_pair" | "setter";
type PairEventType = "deposit" | "skim" | "swap" | "sync" | "withdraw";
type RouterEventType = "add" | "init" | "remove" | "swap";
type TokenAdminEventType = "clawback" | "mint" | "set_admin" | "set_authorized";
type TokenEventType = "approve" | "burn" | "transfer";
type ExtendedTokenEventType = TokenEventType | TokenAdminEventType;
type EventType = FactoryEventType | PairEventType | RouterEventType | TokenAdminEventType | TokenEventType;
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

/**
 * @module
 * Events emitted by Soroswap contracts. For all events:
 * - contractType corresponds to the on-chain event's topic1
 * - eventType corresponds to the on-chain event's topic2
 * - ledger and timestamp come from the chain itself
 */

/**
 * Input type to the factory event parser.
 */
interface BaseRawFactoryEvent extends BaseRawEvent {
    readonly topic1: "SoroswapFactory";
    readonly topic2: FactoryEventType;
    readonly topic3: never;
    readonly topic4: never;
}
interface RawFactoryFeesEvent extends BaseRawFactoryEvent {
    readonly fees_enabled: boolean;
    readonly topic2: "fees";
}
interface RawFactoryFeeToEvent extends BaseRawFactoryEvent {
    readonly new: string;
    readonly old: string;
    readonly setter: string;
    readonly topic2: "fee_to";
}
interface RawFactoryInitEvent extends BaseRawFactoryEvent {
    readonly setter: string;
    readonly topic2: "init";
}
interface RawFactoryNewPairEvent extends BaseRawFactoryEvent {
    readonly new_pairs_length: number;
    readonly pair: string;
    readonly token_0: string;
    readonly token_1: string;
    readonly topic2: "new_pair";
}
interface RawFactorySetterEvent extends BaseRawFactoryEvent {
    readonly new: string;
    readonly old: string;
    readonly topic2: "setter";
}
type RawFactoryEvent = RawFactoryFeesEvent | RawFactoryFeeToEvent | RawFactoryInitEvent | RawFactoryNewPairEvent | RawFactorySetterEvent;
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
type FactoryEvent = FactoryFeeDestinationAddressChangedEvent | FactoryFeesEnabledEvent | FactoryFeeSettingAddressChangedEvent | FactoryInitializedEvent | FactoryNewPairEvent;

interface RawTokenEvent extends BaseRawEvent {
    readonly contractId: string;
    readonly topic1: TokenEventType;
    readonly topic2: string;
    readonly topic3: string;
    readonly topic4: string;
    readonly value: string;
}
interface BaseTokenEvent extends BaseEvent {
    readonly contractId: string;
    readonly contractType: "SorobanToken";
    readonly eventType: TokenEventType;
}
interface TokenApproveEvent extends BaseTokenEvent {
    readonly amount: bigint;
    readonly eventType: "approve";
    readonly expirationLedger: number;
    readonly ownerAddress: string;
    readonly spenderAddress: string;
}
interface TokenBurnEvent extends BaseTokenEvent {
    readonly amount: bigint;
    readonly eventType: "burn";
    readonly ownerAddress: string;
}
interface TokenTransferEvent extends BaseTokenEvent {
    readonly amount: bigint;
    readonly eventType: "transfer";
    readonly recipientAddress: string;
    readonly senderAddress: string;
}
type TokenEvent = TokenApproveEvent | TokenBurnEvent | TokenTransferEvent;
interface RawTokenAdminEvent extends BaseRawEvent {
    readonly contractId: string;
    readonly topic1: TokenAdminEventType;
    readonly topic2: string;
    readonly topic3: string;
    readonly topic4: string;
    readonly value: string;
}
interface BaseTokenAdminEvent extends BaseEvent {
    readonly contractId: string;
    readonly contractType: "SorobanToken";
    readonly eventType: TokenAdminEventType;
}
interface TokenClawbackEvent extends BaseTokenAdminEvent {
    readonly adminAddress: string;
    readonly amount: bigint;
    readonly eventType: "clawback";
    readonly targetAddress: string;
}
interface TokenMintEvent extends BaseTokenAdminEvent {
    readonly adminAddress: string;
    readonly amount: bigint;
    readonly eventType: "mint";
    readonly recipientAddress: string;
}
interface TokenSetAdminEvent extends BaseTokenAdminEvent {
    readonly adminAddress: string;
    readonly eventType: "set_admin";
    readonly newAdminAddress: string;
}
interface TokenSetAuthorizedEvent extends BaseTokenAdminEvent {
    readonly adminAddress: string;
    readonly eventType: "set_authorized";
    readonly isAuthorized: boolean;
    readonly targetAddress: string;
}
type TokenAdminEvent = TokenClawbackEvent | TokenMintEvent | TokenSetAdminEvent | TokenSetAuthorizedEvent;

interface BaseRawPairEvent extends BaseRawEvent {
    readonly contractId: string;
    readonly topic1: "SoroswapPair";
    readonly topic2: PairEventType;
    readonly topic3: never;
    readonly topic4: never;
}
interface RawPairDepositEvent extends BaseRawPairEvent {
    readonly amount_0: string;
    readonly amount_1: string;
    readonly liquidity: string;
    readonly new_reserve_0: string;
    readonly new_reserve_1: string;
    readonly to: string;
    readonly topic2: "deposit";
}
interface RawPairSkimEvent extends BaseRawPairEvent {
    readonly skimmed_0: string;
    readonly skimmed_1: string;
    readonly topic2: "skim";
}
interface RawPairSwapEvent extends BaseRawPairEvent {
    readonly amount_0_in: string;
    readonly amount_0_out: string;
    readonly amount_1_in: string;
    readonly amount_1_out: string;
    readonly to: string;
    readonly topic2: "swap";
}
interface RawPairSyncEvent extends BaseRawPairEvent {
    readonly new_reserve_0: string;
    readonly new_reserve_1: string;
    readonly topic2: "sync";
}
interface RawPairWithdrawEvent extends BaseRawPairEvent {
    readonly amount_0: string;
    readonly amount_1: string;
    readonly liquidity: string;
    readonly new_reserve_0: string;
    readonly new_reserve_1: string;
    readonly to: string;
    readonly topic2: "withdraw";
}
type RawPairProperEvent = RawPairDepositEvent | RawPairSkimEvent | RawPairSwapEvent | RawPairSyncEvent | RawPairWithdrawEvent;
type RawExtendedPairEvent = RawPairProperEvent | RawTokenAdminEvent | RawTokenEvent;
interface BasePairEvent extends BaseEvent {
    readonly contractId: string;
    readonly contractType: "SoroswapPair";
    readonly eventType: PairEventType;
}
interface PairDepositEvent extends BasePairEvent {
    readonly amountOfFirstTokenDeposited: bigint;
    readonly amountOfSecondTokenDeposited: bigint;
    readonly eventType: "deposit";
    readonly liquidityPoolTokensMinted: bigint;
    readonly newReserveOfFirstToken: bigint;
    readonly newReserveOfSecondToken: bigint;
    readonly recipientAddress: string;
}
interface PairSkimEvent extends BasePairEvent {
    readonly amountOfFirstTokenSkimmed: bigint;
    readonly amountOfSecondTokenSkimmed: bigint;
    readonly eventType: "skim";
}
interface PairSwapEvent extends BasePairEvent {
    readonly amountOfFirstTokenIncoming: bigint;
    readonly amountOfFirstTokenOutgoing: bigint;
    readonly amountOfSecondTokenIncoming: bigint;
    readonly amountOfSecondTokenOutgoing: bigint;
    readonly eventType: "swap";
    readonly recipientAddress: string;
}
interface PairSyncEvent extends BasePairEvent {
    readonly eventType: "sync";
    readonly newReserveOfFirstToken: bigint;
    readonly newReserveOfSecondToken: bigint;
}
interface PairWithdrawEvent extends BasePairEvent {
    readonly amountOfFirstTokenWithdrawn: bigint;
    readonly amountOfSecondTokenWithdrawn: bigint;
    readonly eventType: "withdraw";
    readonly liquidityPoolTokensBurned: bigint;
    readonly newReserveOfFirstToken: bigint;
    readonly newReserveOfSecondToken: bigint;
    readonly recipientAddress: string;
}
type PairProperEvent = PairDepositEvent | PairSkimEvent | PairSwapEvent | PairSyncEvent | PairWithdrawEvent;
type ExtendedPairEvent = PairProperEvent | TokenAdminEvent | TokenEvent;

interface BaseRawRouterEvent extends BaseRawEvent {
    readonly topic1: "SoroswapRouter";
    readonly topic2: RouterEventType;
    readonly topic3: never;
    readonly topic4: never;
}
interface RawRouterInitEvent extends BaseRawRouterEvent {
    readonly factory: string;
    readonly topic2: "init";
}
interface RawRouterLiquidityEvent extends BaseRawRouterEvent {
    readonly amount_a: string;
    readonly amount_b: string;
    readonly liquidity: string;
    readonly pair: string;
    readonly to: string;
    readonly token_a: string;
    readonly token_b: string;
    readonly topic2: "add" | "remove";
}
interface RawRouterSwapEvent extends BaseRawRouterEvent {
    readonly amounts: readonly string[];
    readonly path: readonly string[];
    readonly to: string;
    readonly topic2: "swap";
}
type RawRouterEvent = RawRouterInitEvent | RawRouterLiquidityEvent | RawRouterSwapEvent;
interface BaseRouterEvent extends BaseEvent {
    readonly contractType: "SoroswapRouter";
    readonly eventType: RouterEventType;
}
/**
 * Event emitted when the Router contract is initialized; it contains a
 * reference the Factory contract address creating it.
 */
interface RouterInitializedEvent extends BaseRouterEvent {
    readonly eventType: "init";
    readonly factoryAddress: string;
}
interface BaseLiquidityEvent extends BaseRouterEvent {
    readonly firstToken: Asset;
    readonly liquidityPoolAddress: string;
    readonly recipientAddress: string;
    readonly secondToken: Asset;
}
/**
 * Event emitted when liquidity is added to a pair through the Router.
 */
interface RouterAddLiquidityEvent extends BaseLiquidityEvent {
    readonly amountOfFirstTokenDeposited: bigint;
    readonly amountOfSecondTokenDeposited: bigint;
    readonly eventType: "add";
    readonly liquidityPoolTokensMinted: bigint;
}
/**
 * Event emitted when liquidity is removed from a pair through the Router.
 */
interface RouterRemoveLiquidityEvent extends BaseLiquidityEvent {
    readonly amountOfFirstTokenWithdrawn: bigint;
    readonly amountOfSecondTokenWithdrawn: bigint;
    readonly eventType: "remove";
    readonly liquidityPoolTokensBurned: bigint;
}
/**
 * Event emitted when a token swap is executed through the Router.
 * The path represents the sequence of tokens to swap through, where
 * consecutive tokens form the pairs to trade through.
 */
interface RouterSwapEvent extends BaseRouterEvent {
    readonly eventType: "swap";
    readonly recipientAddress: string;
    readonly tokenAmountsInSequence: readonly bigint[];
    readonly tradedTokenSequence: readonly Asset[];
}
type RouterEvent = RouterAddLiquidityEvent | RouterInitializedEvent | RouterRemoveLiquidityEvent | RouterSwapEvent;

type RawSoroswapEvent = RawExtendedPairEvent | RawFactoryEvent | RawRouterEvent;
type SoroswapEvent = ExtendedPairEvent | FactoryEvent | RouterEvent;

/**
 * Fetches the list of certified assets from the Soroswap token list.
 * Assets are cached for 30 days.
 * @param shouldReturnSimpleAssets If true, returns a simpler object with only
 * the code and issuer.
 * @returns A promise that resolves to the list of certified assets.
 * @throws If assets cannot be fetched or cached.
 */
declare const listCertifiedAssets: (shouldReturnSimpleAssets?: boolean) => Promise<AssetData | {
    assets: SimpleAsset[];
}>;
/**
 * Checks if a given asset is certified by Soroswap.
 * @param code The asset code.
 * @param contract The address of the asset contract.
 * @returns A promise that resolves to true if the asset is certified.
 */
declare const isCertifiedAsset: (code: string, contract: string) => Promise<boolean>;
/**
 * Retrieves data about an asset.
 *
 * @param contract The address of the asset's contract.
 * @returns A promise that resolves to the data about the asset.
 * @throws If asset not found (in mainnet only)
 */
declare const getAssetData: (contract: string) => Promise<Asset>;

interface SoroswapConfig {
    readonly assets: {
        readonly url: string;
    };
    readonly contracts: {
        readonly factory: string;
        readonly router: string;
    };
    readonly mercury: {
        readonly apiKey: string;
        readonly backendEndpoint: string;
        readonly graphqlEndpoint: string;
    };
    readonly rpc: {
        readonly url: string;
        readonly wallet: string;
    };
}
type DeepPartial<T> = {
    readonly [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
declare const initializeSoroswapUtils: (userConfig: DeepPartial<SoroswapConfig>) => void;

interface EventGetterOptions {
    readonly shouldReturnRawEvents: boolean;
}
/**
 * Retrieve Soroswap Factory contract events. They are returned in chronological
 * order.
 * @param [options] Options for event retrieval
 * @param {boolean} [options.shouldReturnRawEvents] If true, return events in
 * a less structured format, closer to how they are returned by the chain.
 * @returns A promise that resolves to the event array.
 * @throws If the events cannot be read.
 */
declare const getSoroswapFactoryEvents: (options?: EventGetterOptions) => Promise<readonly (FactoryEvent | RawFactoryEvent)[]>;
/**
 * Retrieve events from Soroswap Router contracts.
 * @param [options] Options for event retrieval
 * @param {boolean} [options.shouldReturnRawEvents] If true, return events in
 * a less structured format, closer to how they are returned by the chain.
 * @returns A promise that resolves to the event array.
 * @throws If the events cannot be read.
 */
declare const getSoroswapRouterEvents: (options?: EventGetterOptions) => Promise<readonly (RouterEvent | RawRouterEvent)[]>;
/**
 * Retrieve events from a given Soroswap Pair contract.
 * @param contractId The contract ID of the Soroswap Pair contract.
 * @param [options] Options for event retrieval
 * @param {boolean} [options.shouldReturnRawEvents] If true, return events in
 * a less structured format, closer to how they are returned by the chain.
 * @returns A promise that resolves to the event array,
 * tagged with its contract ID.
 * @throws If the events cannot be read.
 */
declare const getSoroswapPairEvents: (contractId: string, options?: EventGetterOptions) => Promise<readonly (ExtendedPairEvent | RawExtendedPairEvent)[]>;
/**
 * Retrieve events from multiple SoroswapPair
 * contracts.
 * @param contractIds An array of contract IDs to subscribe to.
 * @returns A promise that resolves to the flat event array.
 * @throws If the events cannot be read.
 */
declare const getEventsFromSoroswapPairs: (contractIds: readonly string[], options?: EventGetterOptions) => Promise<ExtendedPairEvent[]>;
/**
 * Retrieve events from Soroswap contracts of the given types.
 * @param contractTypes An array of types of contracts to subscribe to.
 * These can be:
 *  - the strings "SoroswapFactory" or "factory"
 *  - the strings "SoroswapRouter" or "router"
 *  - an object with either the key "SoroswapPair" or just "pair" and the value
 *    an array of contract IDs to subscribe to.
 * @param [options] Options for event retrieval
 * @param {boolean} [options.shouldReturnRawEvents] If true, return events in
 * a less structured format, closer to how they are returned by the chain.
 * @returns A promise that resolves to the flat event array.
 * @throws If the events cannot be read.
 */
declare const getEventsFromSoroswapContracts: (contractTypes: readonly SoroswapContract[], options?: Readonly<EventGetterOptions>) => Promise<readonly SoroswapEvent[]>;

/**
 * Retrieves the total number of liquidity pools from the Soroswap Factory
 * contract's storage, returning the total number of pairs.
 *
 * @returns A promise that resolves to the total number of liquidity pools.
 * @throws If the contract data cannot be read.
 */
declare const getLiquidityPoolCount: () => Promise<number>;
/**
 * Retrieves all liquidity pool addresses from the Soroswap Factory contract.
 * Since there is no function to do that directly, this function fetches the
 * addresses by iterating through all pairs using their index.
 *
 * @returns A promise that resolves to an array of liquidity pool addresses.
 */
declare const getLiquidityPoolAddresses: () => Promise<string[]>;
/**
 * Retrieves data about a liquidity pool.
 *
 * @param poolAddress The address of the liquidity pool.
 * @returns A promise that resolves to the data about the liquidity pool.
 * @throws If any contract call fails or if asset data cannot be retrieved.
 */
declare const getLiquidityPoolData: (poolAddress: string) => Promise<PoolData>;

/**
 * The Soroswap Factory contract emits events when a new pool is created.
 * Use this function to subscribe to those events.
 * @returns A promise that resolves to true if the subscription was successful.
 */
declare const subscribeToSoroswapFactory: () => Promise<boolean>;
/**
 * The Soroswap Router contract emits events when a swap is executed.
 * Use this function to subscribe to those events.
 * @returns A promise that resolves to true if the subscription was successful.
 */
declare const subscribeToSoroswapRouter: () => Promise<boolean>;
/**
 * Soroswap Pair contracts emit events for operations such as adding or
 * removing liquidity, swapping, or skimming.
 * Use this function to subscribe to those events.
 * @param pairContract The contract ID of the Soroswap Pair contract.
 * @returns A promise that resolves to true if the subscription was successful.
 */
declare const subscribeToSoroswapPair: (pairContract: string) => Promise<boolean>;
/**
 * Subscribe to multiple SoroswapPair contracts.
 * @param contractIds An array of contract IDs to subscribe to.
 * @returns A promise that resolves to true if all subscriptions
 * were successful.
 */
declare const subscribeToSoroswapPairs: (contractIds: readonly string[]) => Promise<boolean>;
/**
 * Subscribe to Soroswap contracts of the given types.
 * @param contractTypes An array of types of contracts to subscribe to.
 * These can be:
 *  - the strings "SoroswapFactory" or "factory"
 *  - the strings "SoroswapRouter" or "router"
 *  - an object with either the key "SoroswapPair" or just "pair" and the value
 *    an array of contract IDs to subscribe to.
 * @returns A promise that resolves to true if all subscriptions
 * were successful.
 */
declare const subscribeToSoroswapContracts: (contractTypes: readonly SoroswapContract[]) => Promise<boolean>;

export { type Asset, type AssetData, type BaseEvent, type BaseRawEvent, type CacheEntry, type ContractType, type EventType, type ExtendedPairEvent, type ExtendedTokenEventType, type FactoryEvent, type FactoryFeeDestinationAddressChangedEvent, type FactoryFeeSettingAddressChangedEvent, type FactoryFeesEnabledEvent, type FactoryInitializedEvent, type FactoryNewPairEvent, type MainnetResponse, type PairDepositEvent, type PairProperEvent, type PairSkimEvent, type PairSwapEvent, type PairSyncEvent, type PairWithdrawEvent, type PoolData, type RawExtendedPairEvent, type RawFactoryEvent, type RawFactoryFeeToEvent, type RawFactoryFeesEvent, type RawFactoryInitEvent, type RawFactoryNewPairEvent, type RawFactorySetterEvent, type RawPairDepositEvent, type RawPairProperEvent, type RawPairSkimEvent, type RawPairSwapEvent, type RawPairSyncEvent, type RawPairWithdrawEvent, type RawRouterEvent, type RawRouterInitEvent, type RawRouterLiquidityEvent, type RawRouterSwapEvent, type RawSoroswapEvent, type RawTokenAdminEvent, type RawTokenEvent, type RouterAddLiquidityEvent, type RouterEvent, type RouterInitializedEvent, type RouterRemoveLiquidityEvent, type RouterSwapEvent, type SimpleAsset, type SoroswapContract, type SoroswapEvent, type TestnetAsset, type TestnetData, type TestnetResponse, type TokenAdminEvent, type TokenApproveEvent, type TokenBurnEvent, type TokenClawbackEvent, type TokenEvent, type TokenMintEvent, type TokenSetAdminEvent, type TokenSetAuthorizedEvent, type TokenTransferEvent, getAssetData, getEventsFromSoroswapContracts, getEventsFromSoroswapPairs, getLiquidityPoolAddresses, getLiquidityPoolCount, getLiquidityPoolData, getSoroswapFactoryEvents, getSoroswapPairEvents, getSoroswapRouterEvents, initializeSoroswapUtils, isCertifiedAsset, listCertifiedAssets, subscribeToSoroswapContracts, subscribeToSoroswapFactory, subscribeToSoroswapPair, subscribeToSoroswapPairs, subscribeToSoroswapRouter };
