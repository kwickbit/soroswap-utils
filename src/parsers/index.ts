import { getAssetData } from "../assets";
import type { Asset, FactoryNewPairEvent } from "../types";
import { getEnvironmentVariable } from "../utils";

const parseFactoryNewPairEvent = async (
    rawEvent: Readonly<{ [key: string]: unknown }>,
): Promise<FactoryNewPairEvent> => {
    const firstToken = (await getAssetData(rawEvent.token_0 as string)) as Asset | undefined;
    const secondToken = (await getAssetData(rawEvent.token_1 as string)) as Asset | undefined;
    const isMainnet = getEnvironmentVariable("IS_TESTNET") !== "true";

    if (isMainnet && (firstToken === undefined || secondToken === undefined)) {
        throw new Error("Failed to fetch token data");
    }

    return {
        contractType: "SoroswapFactory",
        eventType: "new_pair",
        firstToken,
        ledger: rawEvent.ledger as number,
        pairAddress: rawEvent.pair as string,
        pairIndex: rawEvent.new_pairs_length as number,
        secondToken,
        timestamp: rawEvent.timestamp as number,
    };
};

export const parseFactoryEvent = async (
    rawEvent: Readonly<{ [key: string]: unknown }>,
): Promise<FactoryNewPairEvent | Readonly<{ [key: string]: unknown }>> => {
    if (rawEvent.topic2 === "new_pair") {
        return await parseFactoryNewPairEvent(rawEvent);
    }

    return rawEvent;
};
