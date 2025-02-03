/* eslint-disable camelcase, @typescript-eslint/naming-convention */
import { describe, expect, it } from "@jest/globals";

import { parseRouterEvent } from "../event_parsers/router";
import type {
    Asset,
    RawRouterInitEvent,
    RawRouterLiquidityEvent,
    RawRouterSwapEvent,
    RouterAddLiquidityEvent,
    RouterInitializedEvent,
    RouterRemoveLiquidityEvent,
    RouterSwapEvent,
} from "../types";

describe("parseRouterEvent", () => {
    const assets = [
        { contract: "TOKEN_A", isSoroswapCertified: false },
        { contract: "TOKEN_B", isSoroswapCertified: false },
    ] as Asset[];

    it("correctly parses an add liquidity event", () => {
        expect.assertions(1);

        const rawEvent = {
            amount_a: "100",
            amount_b: "200",
            ledger: 123,
            liquidity: "150",
            pair: "PAIR123",
            timestamp: 456,
            to: "RECIPIENT456",
            token_a: "TOKEN_A",
            token_b: "TOKEN_B",
            topic1: "SoroswapRouter",
            topic2: "add",
        } as RawRouterLiquidityEvent;

        const expectedEvent: RouterAddLiquidityEvent = {
            amountOfFirstTokenDeposited: 100n,
            amountOfSecondTokenDeposited: 200n,
            contractType: "SoroswapRouter",
            eventType: "add",

            firstToken: {
                contract: "TOKEN_A",
                isSoroswapCertified: false,
            },

            ledger: 123,
            liquidityPoolAddress: "PAIR123",
            liquidityPoolTokensMinted: 150n,
            recipientAddress: "RECIPIENT456",

            secondToken: {
                contract: "TOKEN_B",
                isSoroswapCertified: false,
            },

            timestamp: 456,
        };

        expect(parseRouterEvent(assets, rawEvent)).toStrictEqual(expectedEvent);
    });

    it("correctly parses an init event", () => {
        expect.assertions(1);

        const rawEvent = {
            factory: "FACTORY123",
            ledger: 123,
            timestamp: 456,
            topic1: "SoroswapRouter",
            topic2: "init",
        } as RawRouterInitEvent;

        const expectedEvent: RouterInitializedEvent = {
            contractType: "SoroswapRouter",
            eventType: "init",
            factoryAddress: "FACTORY123",
            ledger: 123,
            timestamp: 456,
        };

        expect(parseRouterEvent(assets, rawEvent)).toStrictEqual(expectedEvent);
    });

    it("correctly parses a remove liquidity event", () => {
        expect.assertions(1);

        const rawEvent = {
            amount_a: "100",
            amount_b: "200",
            ledger: 123,
            liquidity: "150",
            pair: "PAIR123",
            timestamp: 456,
            to: "RECIPIENT456",
            token_a: "TOKEN_A",
            token_b: "TOKEN_B",
            topic1: "SoroswapRouter",
            topic2: "remove",
        } as RawRouterLiquidityEvent;

        const expectedEvent: RouterRemoveLiquidityEvent = {
            amountOfFirstTokenWithdrawn: 100n,
            amountOfSecondTokenWithdrawn: 200n,
            contractType: "SoroswapRouter",
            eventType: "remove",

            firstToken: {
                contract: "TOKEN_A",
                isSoroswapCertified: false,
            },

            ledger: 123,
            liquidityPoolAddress: "PAIR123",
            liquidityPoolTokensBurned: 150n,
            recipientAddress: "RECIPIENT456",

            secondToken: {
                contract: "TOKEN_B",
                isSoroswapCertified: false,
            },

            timestamp: 456,
        };

        expect(parseRouterEvent(assets, rawEvent)).toStrictEqual(expectedEvent);
    });

    it("correctly parses a swap event", () => {
        expect.assertions(1);

        const rawEvent = {
            amounts: ["100", "95"] as readonly string[],
            ledger: 123,
            path: ["TOKEN_A", "TOKEN_B"] as readonly string[],
            timestamp: 456,
            to: "RECIPIENT456",
            topic1: "SoroswapRouter",
            topic2: "swap",
        } as RawRouterSwapEvent;

        const expectedEvent: RouterSwapEvent = {
            contractType: "SoroswapRouter",
            eventType: "swap",
            ledger: 123,
            recipientAddress: "RECIPIENT456",
            timestamp: 456,
            tokenAmountsInSequence: [100n, 95n],

            tradedTokenSequence: [
                { contract: "TOKEN_A", isSoroswapCertified: false },
                { contract: "TOKEN_B", isSoroswapCertified: false },
            ],
        };

        expect(parseRouterEvent(assets, rawEvent)).toStrictEqual(expectedEvent);
    });
});
