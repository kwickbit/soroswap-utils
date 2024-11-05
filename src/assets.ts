const SOROSWAP_ASSETS_URL =
    "https://raw.githubusercontent.com/soroswap/token-list/main/tokenList.json";

/**
 * Fetches the list of certified assets from the Soroswap token list.
 * @param simple If true, returns a simpler object with only the code and issuer.
 * @returns {Promise<any>} A promise that resolves to the list of certified assets.
 */
export const listCertifiedAssets = async (simple = false): Promise<any> => {
    const data = await fetch(SOROSWAP_ASSETS_URL).then((res) => res.json());

    if (!simple) return data;

    return data.assets.map(({ code, issuer }: { code: string; issuer: string }) => ({
        code,
        issuer,
    }));
};
