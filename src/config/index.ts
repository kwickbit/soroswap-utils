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

// eslint-disable-next-line etc/no-t
type DeepPartial<T> = {
    readonly [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

const defaultTestnetConfig: Readonly<SoroswapConfig> = {
    assets: {
        url: "https://raw.githubusercontent.com/soroswap/core/refs/heads/main/public/tokens.json",
    },

    contracts: {
        factory: "CDFU6AJUBRMCAI4SIC4S3JLCGWUW3GH4N6EDKPJUKYSAZ56TUZIMUYCB",
        router: "CC6WRJYMZA574TOXNO2ZWU4HIXJ5OLKGB7JF556RKMZPSV2V62SLBTPK",
    },

    mercury: {
        apiKey: "", // Required - no default
        backendEndpoint: "", // Required - no default
        graphqlEndpoint: "", // Required - no default
    },

    rpc: {
        url: "https://soroban-testnet.stellar.org:443",
        wallet: "", // Required - no default
    },
};

// Required config fields that must be provided by the user
const requiredConfig = [
    "mercury.apiKey",
    "mercury.backendEndpoint",
    "mercury.graphqlEndpoint",
    "rpc.wallet",
] as const;

const validateConfig = (config: Readonly<SoroswapConfig>): void => {
    const emptyFields = requiredConfig
        .map((path) => {
            const [section, key] = path.split(".");
            const {
                [section as keyof SoroswapConfig]: {
                    [key as keyof (typeof config)[keyof SoroswapConfig]]: value,
                },
            } = config;

            return value === "" ? path : undefined;
        })
        .filter(
            (
                path,
            ): path is
                | "mercury.apiKey"
                | "mercury.backendEndpoint"
                | "mercury.graphqlEndpoint"
                | "rpc.wallet" => path !== undefined,
        );

    if (emptyFields.length > 0) {
        throw new Error(`Missing required configuration: ${emptyFields.join(", ")}`);
    }
};

let config: Readonly<SoroswapConfig> = defaultTestnetConfig;

const initializeSoroswapUtils = (userConfig: DeepPartial<SoroswapConfig>): void => {
    const newConfig = {
        assets: { ...defaultTestnetConfig.assets, ...userConfig.assets },
        contracts: { ...defaultTestnetConfig.contracts, ...userConfig.contracts },
        mercury: { ...defaultTestnetConfig.mercury, ...userConfig.mercury },
        rpc: { ...defaultTestnetConfig.rpc, ...userConfig.rpc },
    };

    validateConfig(newConfig);
    config = newConfig;
};

const getConfig = (): Readonly<SoroswapConfig> => config;

export { getConfig, initializeSoroswapUtils };
