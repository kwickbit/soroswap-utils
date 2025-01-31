"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  getAssetData: () => getAssetData,
  getEventsFromSoroswapContracts: () => getEventsFromSoroswapContracts,
  getEventsFromSoroswapPairs: () => getEventsFromSoroswapPairs,
  getLiquidityPoolAddresses: () => getLiquidityPoolAddresses,
  getLiquidityPoolCount: () => getLiquidityPoolCount,
  getLiquidityPoolData: () => getLiquidityPoolData,
  getSoroswapFactoryEvents: () => getSoroswapFactoryEvents,
  getSoroswapPairEvents: () => getSoroswapPairEvents,
  getSoroswapRouterEvents: () => getSoroswapRouterEvents,
  initializeSoroswapUtils: () => initializeSoroswapUtils,
  isCertifiedAsset: () => isCertifiedAsset,
  listCertifiedAssets: () => listCertifiedAssets,
  subscribeToSoroswapContracts: () => subscribeToSoroswapContracts,
  subscribeToSoroswapFactory: () => subscribeToSoroswapFactory,
  subscribeToSoroswapPair: () => subscribeToSoroswapPair,
  subscribeToSoroswapPairs: () => subscribeToSoroswapPairs,
  subscribeToSoroswapRouter: () => subscribeToSoroswapRouter
});
module.exports = __toCommonJS(index_exports);

// src/assets.ts
var import_promises = require("fs/promises");
var import_node_path = require("path");

// src/config/index.ts
var defaultTestnetConfig = {
  assets: {
    url: "https://raw.githubusercontent.com/soroswap/core/refs/heads/main/public/tokens.json"
  },
  contracts: {
    factory: "CDFU6AJUBRMCAI4SIC4S3JLCGWUW3GH4N6EDKPJUKYSAZ56TUZIMUYCB",
    router: "CC6WRJYMZA574TOXNO2ZWU4HIXJ5OLKGB7JF556RKMZPSV2V62SLBTPK"
  },
  mercury: {
    apiKey: "",
    // Required - no default
    backendEndpoint: "",
    // Required - no default
    graphqlEndpoint: ""
    // Required - no default
  },
  rpc: {
    url: "https://soroban-testnet.stellar.org:443",
    wallet: ""
    // Required - no default
  }
};
var requiredConfig = [
  "mercury.apiKey",
  "mercury.backendEndpoint",
  "mercury.graphqlEndpoint",
  "rpc.wallet"
];
var validateConfig = (config2) => {
  const emptyFields = requiredConfig.map((path) => {
    const [section, key] = path.split(".");
    const {
      [section]: {
        [key]: value
      }
    } = config2;
    return value === "" ? path : void 0;
  }).filter(
    (path) => path !== void 0
  );
  if (emptyFields.length > 0) {
    throw new Error(`Missing required configuration: ${emptyFields.join(", ")}`);
  }
};
var config = defaultTestnetConfig;
var initializeSoroswapUtils = (userConfig) => {
  const newConfig = {
    assets: { ...defaultTestnetConfig.assets, ...userConfig.assets },
    contracts: { ...defaultTestnetConfig.contracts, ...userConfig.contracts },
    mercury: { ...defaultTestnetConfig.mercury, ...userConfig.mercury },
    rpc: { ...defaultTestnetConfig.rpc, ...userConfig.rpc }
  };
  validateConfig(newConfig);
  config = newConfig;
};
var getConfig = () => config;

// src/assets.ts
var cacheDirectory = (0, import_node_path.join)(process.cwd(), "node_modules", "soroswap-utils", ".cache");
void (async () => {
  try {
    await (0, import_promises.access)(cacheDirectory);
  } catch {
    await (0, import_promises.mkdir)(cacheDirectory, { recursive: true });
  }
})();
var mainnetCacheFile = (0, import_node_path.join)(cacheDirectory, "assets.json");
var testnetCacheFile = (0, import_node_path.join)(cacheDirectory, "testnet-assets.json");
var daysToCache = 30;
var hoursPerDay = 24;
var minutesPerHour = 60;
var secondsPerMinute = 60;
var millisecondsPerSecond = 1e3;
var cacheTtl = daysToCache * hoursPerDay * minutesPerHour * secondsPerMinute * millisecondsPerSecond;
var extractTestnetData = (data) => (
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  data.find((item) => item.network === "testnet")
);
var fetchAssets = async () => {
  const config2 = getConfig();
  const response = await fetch(config2.assets.url);
  const dataFromResponse = await response.json();
  const isTestnet = config2.rpc.url.includes("testnet");
  const data = isTestnet ? extractTestnetData(dataFromResponse) : dataFromResponse;
  const certifiedData = {
    ...data,
    assets: data.assets.map((asset) => ({ ...asset, isSoroswapCertified: !isTestnet }))
  };
  await (0, import_promises.writeFile)(
    isTestnet ? testnetCacheFile : mainnetCacheFile,
    // Rule disabled because neither I nor Claude AI are smart enough to
    // figure out how to make this work.
    // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
    JSON.stringify({ data: certifiedData, timestamp: Date.now() })
  );
  return data;
};
var readCache = async () => {
  const isTestnet = getConfig().rpc.url.includes("testnet");
  const content = await (0, import_promises.readFile)(isTestnet ? testnetCacheFile : mainnetCacheFile, "utf8");
  return JSON.parse(content);
};
var getCachedOrFetch = async () => {
  try {
    const cache = await readCache();
    const isDataFresh = Date.now() - cache.timestamp < cacheTtl;
    if (!isDataFresh) {
      return await fetchAssets();
    }
    const isTestnet = getConfig().rpc.url.includes("testnet");
    if (!isTestnet) {
      return cache.data;
    }
    return cache.data;
  } catch {
    return await fetchAssets();
  }
};
var simplifyAssets = (data) => ({
  assets: data.assets.map(({ code, contract, isSoroswapCertified, issuer }) => ({
    code,
    contract,
    isSoroswapCertified,
    issuer
  }))
});
var listCertifiedAssets = async (shouldReturnSimpleAssets = false) => {
  try {
    const data = await getCachedOrFetch();
    return shouldReturnSimpleAssets ? simplifyAssets(data) : data;
  } catch (error) {
    console.error("Failed to get assets:", error);
    throw error;
  }
};
var isCertifiedAsset = async (code, contract) => {
  if (code === "XLM" && contract === "Native") {
    return true;
  }
  const { assets } = await listCertifiedAssets();
  return assets.some(
    (asset) => asset.code === code && asset.contract === contract
  );
};
var getAssetData = async (contract) => {
  const soroswapAssets = await getCachedOrFetch();
  const assetData = soroswapAssets.assets.find((asset) => asset.contract === contract);
  if (assetData === void 0) {
    return { contract, isSoroswapCertified: false };
  }
  return assetData;
};

// src/events.ts
var import_mercury_sdk2 = require("mercury-sdk");

// src/event_parsers/common.ts
var parseCommonProperties = (rawEvent) => ({
  contractType: rawEvent.topic1,
  eventType: rawEvent.topic2,
  ledger: rawEvent.ledger,
  timestamp: rawEvent.timestamp
});
var parsePairProperties = (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  contractId: rawEvent.contractId
});
var parseTokenProperties = (rawEvent) => ({
  contractId: rawEvent.contractId,
  contractType: "SorobanToken",
  eventType: rawEvent.topic1,
  ledger: rawEvent.ledger,
  timestamp: rawEvent.timestamp
});

// src/event_parsers/factory.ts
var parseFactoryFeesEvent = (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  areFeesEnabledNow: rawEvent.fees_enabled
});
var parseFactoryFeeToEvent = (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  feeSettingAddress: rawEvent.setter,
  newFeeDestinationAddress: rawEvent.new,
  oldFeeDestinationAddress: rawEvent.old
});
var parseFactoryInitEvent = (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  feeSettingAddress: rawEvent.setter
});
var parseFactoryNewPairEvent = async (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  firstToken: await getAssetData(rawEvent.token_0),
  pairAddress: rawEvent.pair,
  pairIndex: rawEvent.new_pairs_length,
  secondToken: await getAssetData(rawEvent.token_1)
});
var parseFactorySetterEvent = (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  newfeeSettingAddress: rawEvent.new,
  oldfeeSettingAddress: rawEvent.old
});
var parseFactoryEvent = async (rawEvent) => {
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
      throw new Error("Unknown factory event type.");
    }
  }
};

// src/event_parsers/token.ts
var parseTokenApproveEvent = (rawEvent) => ({
  ...parseTokenProperties(rawEvent),
  amount: BigInt(rawEvent.value),
  expirationLedger: Number(rawEvent.value),
  ownerAddress: rawEvent.topic2,
  spenderAddress: rawEvent.topic3
});
var parseTokenBurnEvent = (rawEvent) => ({
  ...parseTokenProperties(rawEvent),
  amount: BigInt(rawEvent.value),
  ownerAddress: rawEvent.topic2
});
var parseTokenClawbackEvent = (rawEvent) => ({
  ...parseTokenProperties(rawEvent),
  adminAddress: rawEvent.topic2,
  amount: BigInt(rawEvent.value),
  targetAddress: rawEvent.topic3
});
var parseTokenMintEvent = (rawEvent) => ({
  ...parseTokenProperties(rawEvent),
  adminAddress: rawEvent.topic2,
  amount: BigInt(rawEvent.value),
  recipientAddress: rawEvent.topic3
});
var parseTokenSetAdminEvent = (rawEvent) => ({
  ...parseTokenProperties(rawEvent),
  adminAddress: rawEvent.topic2,
  newAdminAddress: rawEvent.value
});
var parseTokenSetAuthorizedEvent = (rawEvent) => ({
  ...parseTokenProperties(rawEvent),
  adminAddress: rawEvent.topic2,
  isAuthorized: Boolean(rawEvent.value),
  targetAddress: rawEvent.topic3
});
var parseTokenTransferEvent = (rawEvent) => ({
  ...parseTokenProperties(rawEvent),
  amount: BigInt(rawEvent.value),
  recipientAddress: rawEvent.topic3,
  senderAddress: rawEvent.topic2
});
var parseSorobanTokenEvent = (rawEvent) => {
  switch (rawEvent.topic1) {
    case "approve": {
      return parseTokenApproveEvent(rawEvent);
    }
    case "burn": {
      return parseTokenBurnEvent(rawEvent);
    }
    case "clawback": {
      return parseTokenClawbackEvent(rawEvent);
    }
    case "mint": {
      return parseTokenMintEvent(rawEvent);
    }
    case "set_admin": {
      return parseTokenSetAdminEvent(rawEvent);
    }
    case "set_authorized": {
      return parseTokenSetAuthorizedEvent(rawEvent);
    }
    case "transfer": {
      return parseTokenTransferEvent(rawEvent);
    }
    default: {
      throw new Error("Unknown token event type.");
    }
  }
};

// src/event_parsers/pair.ts
var parsePairDepositEvent = (rawEvent) => ({
  ...parsePairProperties(rawEvent),
  amountOfFirstTokenDeposited: BigInt(rawEvent.amount_0),
  amountOfSecondTokenDeposited: BigInt(rawEvent.amount_1),
  liquidityPoolTokensMinted: BigInt(rawEvent.liquidity),
  newReserveOfFirstToken: BigInt(rawEvent.new_reserve_0),
  newReserveOfSecondToken: BigInt(rawEvent.new_reserve_1),
  recipientAddress: rawEvent.to
});
var parsePairSwapEvent = (rawEvent) => ({
  ...parsePairProperties(rawEvent),
  amountOfFirstTokenIncoming: BigInt(rawEvent.amount_0_in),
  amountOfFirstTokenOutgoing: BigInt(rawEvent.amount_0_out),
  amountOfSecondTokenIncoming: BigInt(rawEvent.amount_1_in),
  amountOfSecondTokenOutgoing: BigInt(rawEvent.amount_1_out),
  recipientAddress: rawEvent.to
});
var parsePairSyncEvent = (rawEvent) => ({
  ...parsePairProperties(rawEvent),
  newReserveOfFirstToken: BigInt(rawEvent.new_reserve_0),
  newReserveOfSecondToken: BigInt(rawEvent.new_reserve_1)
});
var parsePairSkimEvent = (rawEvent) => ({
  ...parsePairProperties(rawEvent),
  amountOfFirstTokenSkimmed: BigInt(rawEvent.skimmed_0),
  amountOfSecondTokenSkimmed: BigInt(rawEvent.skimmed_1)
});
var parsePairWithdrawEvent = (rawEvent) => ({
  ...parsePairProperties(rawEvent),
  amountOfFirstTokenWithdrawn: BigInt(rawEvent.amount_0),
  amountOfSecondTokenWithdrawn: BigInt(rawEvent.amount_1),
  liquidityPoolTokensBurned: BigInt(rawEvent.liquidity),
  newReserveOfFirstToken: BigInt(rawEvent.new_reserve_0),
  newReserveOfSecondToken: BigInt(rawEvent.new_reserve_1),
  recipientAddress: rawEvent.to
});
var parseSoroswapPairEvent = (rawEvent) => {
  switch (rawEvent.topic2) {
    case "deposit": {
      return parsePairDepositEvent(rawEvent);
    }
    case "swap": {
      return parsePairSwapEvent(rawEvent);
    }
    case "sync": {
      return parsePairSyncEvent(rawEvent);
    }
    case "skim": {
      return parsePairSkimEvent(rawEvent);
    }
    case "withdraw": {
      return parsePairWithdrawEvent(rawEvent);
    }
    default: {
      throw new Error("Unknown SoroswapPair event type.");
    }
  }
};
var parsePairEvent = (rawEvent) => {
  if (rawEvent.topic1 === "SoroswapPair") {
    return parseSoroswapPairEvent(rawEvent);
  }
  if ([
    "approve",
    "burn",
    "clawback",
    "mint",
    "set_admin",
    "set_authorized",
    "transfer"
  ].includes(rawEvent.topic1)) {
    return parseSorobanTokenEvent(rawEvent);
  }
  throw new Error(`Unknown event type: ${rawEvent.topic1}/${rawEvent.topic2}`);
};

// src/event_parsers/router.ts
var parseRouterAddLiquidityEvent = async (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  amountOfFirstTokenDeposited: BigInt(rawEvent.amount_a),
  amountOfSecondTokenDeposited: BigInt(rawEvent.amount_b),
  firstToken: await getAssetData(rawEvent.token_a),
  liquidityPoolAddress: rawEvent.pair,
  liquidityPoolTokensMinted: BigInt(rawEvent.liquidity),
  recipientAddress: rawEvent.to,
  secondToken: await getAssetData(rawEvent.token_b)
});
var parseRouterInitEvent = (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  factoryAddress: rawEvent.factory
});
var parseRouterRemoveLiquidityEvent = async (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  amountOfFirstTokenWithdrawn: BigInt(rawEvent.amount_a),
  amountOfSecondTokenWithdrawn: BigInt(rawEvent.amount_b),
  firstToken: await getAssetData(rawEvent.token_a),
  liquidityPoolAddress: rawEvent.pair,
  liquidityPoolTokensBurned: BigInt(rawEvent.liquidity),
  recipientAddress: rawEvent.to,
  secondToken: await getAssetData(rawEvent.token_b)
});
var parseRouterSwapEvent = async (rawEvent) => ({
  ...parseCommonProperties(rawEvent),
  recipientAddress: rawEvent.to,
  tokenAmountsInSequence: rawEvent.amounts.map(BigInt),
  tradedTokenSequence: await Promise.all(rawEvent.path.map(getAssetData))
});
var parseRouterEvent = async (rawEvent) => {
  switch (rawEvent.topic2) {
    case "add": {
      return await parseRouterAddLiquidityEvent(
        rawEvent
      );
    }
    case "init": {
      return parseRouterInitEvent(rawEvent);
    }
    case "remove": {
      return await parseRouterRemoveLiquidityEvent(
        rawEvent
      );
    }
    case "swap": {
      return await parseRouterSwapEvent(rawEvent);
    }
    default: {
      throw new Error("Unknown SoroswapRouter event type.");
    }
  }
};

// src/utils.ts
var import_mercury_sdk = require("mercury-sdk");
var validateString = (value, errorMessage) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(errorMessage);
  } else {
    return value;
  }
};
var buildMercuryInstance = () => {
  const config2 = getConfig();
  const mercuryArguments = {
    apiKey: config2.mercury.apiKey,
    backendEndpoint: config2.mercury.backendEndpoint,
    graphqlEndpoint: config2.mercury.graphqlEndpoint
  };
  return new import_mercury_sdk.Mercury(mercuryArguments);
};
var resolveContractId = (contractId, isEnvironmentVariable) => {
  const { contracts } = getConfig();
  if (!isEnvironmentVariable) {
    return contractId;
  }
  switch (contractId) {
    case "SOROSWAP_FACTORY_CONTRACT": {
      return contracts.factory;
    }
    case "SOROSWAP_ROUTER_CONTRACT": {
      return contracts.router;
    }
    default: {
      throw new Error(`Unknown contract type: ${contractId}`);
    }
  }
};

// src/events.ts
var fetchSoroswapEvents = async (contractId, isEnvironmentVariable = false) => {
  const mercuryInstance = buildMercuryInstance();
  const resolvedContract = resolveContractId(contractId, isEnvironmentVariable);
  const soroswapEvents = await mercuryInstance.getContractEvents({
    contractId: resolvedContract
  });
  if (soroswapEvents.error !== void 0) {
    throw new Error(soroswapEvents.error);
  }
  if (soroswapEvents.data === null) {
    throw new Error("No events found");
  }
  return (0, import_mercury_sdk2.getContractEventsParser)(soroswapEvents.data);
};
var getSoroswapFactoryEvents = async (options) => {
  const rawEvents = await fetchSoroswapEvents(
    "SOROSWAP_FACTORY_CONTRACT",
    true
  );
  rawEvents.reverse();
  if (options?.shouldReturnRawEvents !== void 0 && options.shouldReturnRawEvents) {
    return rawEvents;
  }
  return await Promise.all(rawEvents.map(parseFactoryEvent));
};
var getSoroswapRouterEvents = async (options) => {
  console.error("Hello from getSoroswapRouterEvents");
  const rawEvents = await fetchSoroswapEvents(
    "SOROSWAP_ROUTER_CONTRACT",
    true
  );
  if (options?.shouldReturnRawEvents !== void 0 && options.shouldReturnRawEvents) {
    return rawEvents;
  }
  return await Promise.all(rawEvents.map(parseRouterEvent));
};
var getSoroswapPairEvents = async (contractId, options) => {
  const rawEvents = await fetchSoroswapEvents(contractId);
  const rawEventsWithContractId = rawEvents.map((event) => ({ ...event, contractId }));
  return options?.shouldReturnRawEvents !== void 0 && options.shouldReturnRawEvents ? rawEventsWithContractId : await Promise.all(rawEventsWithContractId.map(parsePairEvent));
};
var getEventsFromSoroswapPairs = async (contractIds, options) => {
  const rawEvents = await Promise.all(
    contractIds.map(async (contractId) => await getSoroswapPairEvents(contractId, options))
  );
  return rawEvents.flat();
};
var doStringContractType = (contractType, promises, subscriptions, options) => {
  if (["factory", "SoroswapFactory"].includes(contractType) && !subscriptions.includes("factory")) {
    return {
      options,
      promises: [...promises, getSoroswapFactoryEvents(options)],
      subscriptions: [...subscriptions, "factory"]
    };
  }
  if (["router", "SoroswapRouter"].includes(contractType) && !subscriptions.includes("router")) {
    return {
      options,
      promises: [...promises, getSoroswapRouterEvents(options)],
      subscriptions: [...subscriptions, "router"]
    };
  }
  throw new Error("Invalid contract type");
};
var eventFetcher = ({
  options,
  promises,
  subscriptions
}, contractType) => {
  switch (typeof contractType) {
    case "string": {
      return doStringContractType(contractType, promises, subscriptions, options);
    }
    case "object": {
      const pairsToFetchFrom = contractType.pair ?? contractType.SoroswapPair;
      return {
        options,
        promises: [...promises, getEventsFromSoroswapPairs(pairsToFetchFrom, options)],
        subscriptions: [...subscriptions, ...pairsToFetchFrom]
      };
    }
    default: {
      throw new Error("Invalid contract type");
    }
  }
};
var getEventsFromSoroswapContracts = async (contractTypes, options) => {
  const { promises: returnedPromises } = contractTypes.reduce(eventFetcher, {
    options: options ?? { shouldReturnRawEvents: false },
    promises: [],
    subscriptions: []
  });
  const rawEvents = await Promise.all(returnedPromises);
  return rawEvents.flat();
};

// src/pools.ts
var import_stellar_sdk = require("@stellar/stellar-sdk");
var transactionTimeout = 30;
var callSorobanFunction = async (contractAddress, sorobanFunctionName, sorobanFunctionArguments) => {
  const {
    rpc: { url, wallet }
  } = getConfig();
  const server = new import_stellar_sdk.SorobanRpc.Server(url);
  const sourceAccount = await server.getAccount(wallet);
  const contract = new import_stellar_sdk.Contract(contractAddress);
  const call = sorobanFunctionArguments ? contract.call(sorobanFunctionName, sorobanFunctionArguments) : contract.call(sorobanFunctionName);
  const transaction = new import_stellar_sdk.TransactionBuilder(sourceAccount, {
    fee: import_stellar_sdk.BASE_FEE,
    networkPassphrase: import_stellar_sdk.Networks.TESTNET
  }).addOperation(call).setTimeout(transactionTimeout).build();
  return await server._simulateTransaction(transaction);
};
var callPoolContract = async (poolAddress, sorobanFunctionName) => {
  const result = await callSorobanFunction(poolAddress, sorobanFunctionName);
  const firstResult = result.results?.[0];
  if (firstResult === void 0) {
    throw new Error("Calling the contract failed");
  }
  return (0, import_stellar_sdk.scValToNative)(import_stellar_sdk.xdr.ScVal.fromXDR(firstResult.xdr, "base64"));
};
var getAssetData2 = async (poolAddress, functionName) => {
  const assetAddress = await callPoolContract(poolAddress, functionName);
  return await getAssetData(assetAddress);
};
var getLiquidityPoolCount = async () => {
  const config2 = getConfig();
  const server = new import_stellar_sdk.SorobanRpc.Server(config2.rpc.url);
  const { val: value } = await server.getContractData(
    config2.contracts.factory,
    import_stellar_sdk.xdr.ScVal.scvLedgerKeyContractInstance()
  );
  const storage = value.contractData().val().instance().storage();
  if (storage === null) {
    throw new Error("Could not read the contract data");
  }
  return (0, import_stellar_sdk.scValToNative)(import_stellar_sdk.xdr.ScVal.scvMap(storage)).TotalPairs;
};
var getLiquidityPoolAddress = async (index) => {
  const config2 = getConfig();
  const liquidityPoolAddress = await callSorobanFunction(
    config2.contracts.factory,
    "all_pairs",
    (0, import_stellar_sdk.nativeToScVal)(index, { type: "u32" })
  );
  if (!liquidityPoolAddress.results) {
    return void 0;
  }
  const address = import_stellar_sdk.xdr.ScVal.fromXDR(
    validateString(
      liquidityPoolAddress.results[0]?.xdr,
      "Invalid response: missing pool address"
    ),
    "base64"
  );
  return import_stellar_sdk.Address.fromScVal(address).toString();
};
var getLiquidityPoolAddresses = async () => await Promise.all(
  Array.from(
    { length: await getLiquidityPoolCount() },
    // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
    async (_unused, index) => await getLiquidityPoolAddress(index)
  )
).then((results) => results.filter((address) => address !== void 0));
var getLiquidityPoolData = async (poolAddress) => ({
  // We call Soroban functions on the contract to populate the pool data.
  // Then we try to get more detailed data about the tokens.
  constantProductOfReserves: await callPoolContract(poolAddress, "k_last"),
  firstToken: await getAssetData2(poolAddress, "token_0"),
  poolContract: poolAddress,
  reserves: await callPoolContract(poolAddress, "get_reserves"),
  secondToken: await getAssetData2(poolAddress, "token_1")
});

// src/subscriptions.ts
var soroswapSubscriber = async (contractId, isEnvironmentVariable = false) => {
  const mercuryInstance = buildMercuryInstance();
  const resolvedContract = resolveContractId(contractId, isEnvironmentVariable);
  const response = await mercuryInstance.subscribeToContractEvents({
    contractId: resolvedContract
  });
  return response.data;
};
var subscribeToSoroswapFactory = async () => await soroswapSubscriber("SOROSWAP_FACTORY_CONTRACT", true);
var subscribeToSoroswapRouter = async () => await soroswapSubscriber("SOROSWAP_ROUTER_CONTRACT", true);
var subscribeToSoroswapPair = async (pairContract) => await soroswapSubscriber(pairContract);
var subscribeToSoroswapPairs = async (contractIds) => {
  const promises = contractIds.map(
    async (pairContract) => await soroswapSubscriber(pairContract)
  );
  return await Promise.all(promises).then((results) => results.every(Boolean));
};
var doStringContractType2 = (contractType, subscriptions, promises) => {
  if (["factory", "SoroswapFactory"].includes(contractType) && !subscriptions.includes("factory")) {
    return {
      promises: [...promises, subscribeToSoroswapFactory()],
      subscriptions: [...subscriptions, "factory"]
    };
  }
  if (["router", "SoroswapRouter"].includes(contractType) && !subscriptions.includes("router")) {
    return {
      promises: [...promises, subscribeToSoroswapRouter()],
      subscriptions: [...subscriptions, "router"]
    };
  }
  throw new Error("Invalid contract type");
};
var contractSubscriber = ({
  promises,
  subscriptions
}, contractType) => {
  switch (typeof contractType) {
    case "string": {
      return doStringContractType2(contractType, subscriptions, promises);
    }
    case "object": {
      const pairsToSubscribeTo = contractType.pair ?? contractType.SoroswapPair;
      return {
        promises: [...promises, subscribeToSoroswapPairs(pairsToSubscribeTo)],
        subscriptions: [...subscriptions, ...pairsToSubscribeTo]
      };
    }
    default: {
      throw new Error("Invalid contract type");
    }
  }
};
var subscribeToSoroswapContracts = async (contractTypes) => {
  const { promises: returnedPromises } = contractTypes.reduce(contractSubscriber, {
    promises: [],
    subscriptions: []
  });
  return await Promise.all(returnedPromises).then((results) => results.every(Boolean));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAssetData,
  getEventsFromSoroswapContracts,
  getEventsFromSoroswapPairs,
  getLiquidityPoolAddresses,
  getLiquidityPoolCount,
  getLiquidityPoolData,
  getSoroswapFactoryEvents,
  getSoroswapPairEvents,
  getSoroswapRouterEvents,
  initializeSoroswapUtils,
  isCertifiedAsset,
  listCertifiedAssets,
  subscribeToSoroswapContracts,
  subscribeToSoroswapFactory,
  subscribeToSoroswapPair,
  subscribeToSoroswapPairs,
  subscribeToSoroswapRouter
});
