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
        readonly privateKey: string;
        readonly url: string;
    };
}

// eslint-disable-next-line etc/no-t
type DeepPartial<T> = {
    readonly [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

const defaultTestnetConfig: Readonly<SoroswapConfig> = {
    assets: {
        url: "https://github.com/soroswap/core/blob/main/public/tokens.json",
    },

    contracts: {
        factory: "CD7OQTUYT7J4BN6EQWK6XX5SVDWFLKKFZ3PJ7GUJGLFIJSV52ZIQBWLG",
        router: "CCPEDSWPNWJTRIODNYO3THDJ6RYTMMAMDCGAIORRISXKGYU632Y475IF",
    },

    mercury: {
        apiKey: "", // Required - no default
        backendEndpoint: "", // Required - no default
        graphqlEndpoint: "", // Required - no default
    },

    rpc: {
        privateKey: "", // Required - no default
        url: "https://soroban-testnet.stellar.org:443",
    },
};

// Required config fields that must be provided by the user
const requiredConfig = [
    "rpc.privateKey",
    "mercury.apiKey",
    "mercury.backendEndpoint",
    "mercury.graphqlEndpoint",
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
                | "rpc.privateKey"
                | "mercury.apiKey"
                | "mercury.backendEndpoint"
                | "mercury.graphqlEndpoint" => path !== undefined,
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
