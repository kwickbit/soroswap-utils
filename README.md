# soroswap-utils

This library provides utilities to interact with Soroswap, the decentralized exchange (DEX) on Soroban, which is the smart contracts platform of the Stellar network.

## Configuration

Before using the library, you must initialize it with your configuration (see `.env.example`):

```typescript
import { initializeSoroswap } from 'soroswap-utils';

initializeSoroswap({
    assets: {
        url:     // Provide if interacting with the Stellar mainnet
    },
    contracts: {
        factory: // Provide if interacting with the Stellar mainnet
        router:  // Provide if interacting with the Stellar mainnet
    },
    mercury: {
        apiKey: "YOUR_MERCURY_API_KEY",      // Required
        backendEndpoint: "MERCURY_BACKEND",  // Required
        graphqlEndpoint: "MERCURY_GRAPHQL"   // Required
    },
    rpc: {
        url:     // Provide if interacting with the Stellar mainnet
        wallet: "YOUR_STELLAR_WALLET",       // Required
    }
});
```

### Mercury SDK Dependencies

This library depends on the Mercury SDK. The Mercury API key and endpoints are usually set up during the Mercury SDK installation. If you haven't installed and configured the Mercury SDK, please refer to their documentation first.

## Docs

For library documentation, run:

```
$ bun run docs:serve
```
