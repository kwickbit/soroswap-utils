# soroswap-utils

This library provides utilities to interact with Soroswap, the decentralized exchange (DEX) on Soroban, which is the smart contracts platform of the Stellar network.

In order to use the library, you'll need to provide a private key in your `.env` file, and also the other variables already present in `.env.example`.

## Configuration

Before using the library, you must initialize it with your configuration:

```typescript
import { initializeSoroswap } from 'soroswap-utils';

initializeSoroswap({
    rpc: {
        privateKey: "YOUR_PRIVATE_KEY",      // Required
    },
    mercury: {
        apiKey: "YOUR_MERCURY_API_KEY",      // Required
        backendEndpoint: "MERCURY_BACKEND",  // Required
        graphqlEndpoint: "MERCURY_GRAPHQL"   // Required
    }
});
```

### Required Configuration

The following configuration values must be provided:
- `rpc.privateKey`: Your Stellar/Soroban private key
- `mercury.apiKey`: Your Mercury API key (obtain from Mercury)
- `mercury.backendEndpoint`: Mercury backend endpoint
- `mercury.graphqlEndpoint`: Mercury GraphQL endpoint

All other configuration values have sensible testnet defaults. For mainnet usage, you'll need to override the contract addresses and RPC URL.

### Mercury SDK Dependencies

This library depends on the Mercury SDK. The Mercury API key and endpoints are usually set up during the Mercury SDK installation. If you haven't installed and configured the Mercury SDK, please refer to their documentation first.
