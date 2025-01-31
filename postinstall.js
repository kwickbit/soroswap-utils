import fs from "fs";
import path from "path";
import { initializeSoroswapUtils, listCertifiedAssets } from "./dist/index.js";

void (async () => {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const successFileName = process.env.SOROBAN_RPC_SERVER.includes("testnet")
    ? "testnet-assets.json"
    : "assets.json";
  const successFile = path.resolve(__dirname, `.cache/${successFileName}`);
  const failFile = path.resolve(__dirname, `error.txt`);

  if (await fs.promises.stat(successFile).catch(() => false)) {
    await fs.promises.unlink(successFile);
  }

  if (await fs.promises.stat(failFile).catch(() => false)) {
    await fs.promises.unlink(failFile);
  }

  initializeSoroswapUtils({
    assets: {
      url: process.env.SOROSWAP_ASSETS_URL,
    },

    contracts: {
      factory: process.env.SOROSWAP_FACTORY_CONTRACT,
      router: process.env.SOROSWAP_ROUTER_CONTRACT,
    },

    mercury: {
      apiKey: process.env.MERCURY_API_KEY,
      backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
      graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
    },

    rpc: {
      url: process.env.SOROBAN_RPC_SERVER,
      wallet: process.env.STELLAR_WALLET,
    },
  });

  try {
    const assets = await listCertifiedAssets();
    await fs.promises.mkdir(path.dirname(successFile));
    await fs.promises.writeFile(successFile, JSON.stringify(assets, null, 2));
  } catch (error) {
    await fs.promises.writeFile(
      failFile,
      `Error: ${error.message}\n${error.stack}`,
    );
  }
})();
