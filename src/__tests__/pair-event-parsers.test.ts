/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import { describe, expect, it } from "@jest/globals";

import { parsePairEvent } from "../event_parsers/pair";
import type {
    PairDepositEvent,
    PairSkimEvent,
    PairSwapEvent,
    PairSyncEvent,
    PairWithdrawEvent,
    RawPairDepositEvent,
    RawPairSkimEvent,
    RawPairSwapEvent,
    RawPairSyncEvent,
    RawPairWithdrawEvent,
} from "../types";

describe("parsePairEvent", () => {
    it("correctly parses a deposit event", () => {
        expect.assertions(1);

        const rawEvent = {
            amount_0: "100",
            amount_1: "200",
            contractId: "CONTRACT123",
            ledger: 123,
            liquidity: "150",
            new_reserve_0: "1100",
            new_reserve_1: "1200",
            timestamp: 456,
            to: "RECIPIENT456",
            topic1: "SoroswapPair",
            topic2: "deposit",
        } as RawPairDepositEvent;

        const expectedEvent: PairDepositEvent = {
            amountOfFirstTokenDeposited: 100n,
            amountOfSecondTokenDeposited: 200n,
            contractId: "CONTRACT123",
            contractType: "SoroswapPair",
            eventType: "deposit",
            ledger: 123,
            liquidityPoolTokensMinted: 150n,
            newReserveOfFirstToken: 1100n,
            newReserveOfSecondToken: 1200n,
            recipientAddress: "RECIPIENT456",
            timestamp: 456,
        };

        expect(parsePairEvent(rawEvent)).toStrictEqual(expectedEvent);
    });

    it("correctly parses a skim event", () => {
        expect.assertions(1);

        const rawEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            skimmed_0: "10",
            skimmed_1: "20",
            timestamp: 456,
            topic1: "SoroswapPair",
            topic2: "skim",
        } as RawPairSkimEvent;

        const expectedEvent: PairSkimEvent = {
            amountOfFirstTokenSkimmed: 10n,
            amountOfSecondTokenSkimmed: 20n,
            contractId: "CONTRACT123",
            contractType: "SoroswapPair",
            eventType: "skim",
            ledger: 123,
            timestamp: 456,
        };

        expect(parsePairEvent(rawEvent)).toStrictEqual(expectedEvent);
    });

    it("correctly parses a swap event", () => {
        expect.assertions(1);

        const rawEvent = {
            amount_0_in: "100",
            amount_0_out: "0",
            amount_1_in: "0",
            amount_1_out: "95",
            contractId: "CONTRACT123",
            ledger: 123,
            timestamp: 456,
            to: "RECIPIENT456",
            topic1: "SoroswapPair",
            topic2: "swap",
        } as RawPairSwapEvent;

        const expectedEvent: PairSwapEvent = {
            amountOfFirstTokenIncoming: 100n,
            amountOfFirstTokenOutgoing: 0n,
            amountOfSecondTokenIncoming: 0n,
            amountOfSecondTokenOutgoing: 95n,
            contractId: "CONTRACT123",
            contractType: "SoroswapPair",
            eventType: "swap",
            ledger: 123,
            recipientAddress: "RECIPIENT456",
            timestamp: 456,
        };

        expect(parsePairEvent(rawEvent)).toStrictEqual(expectedEvent);
    });

    it("correctly parses a sync event", () => {
        expect.assertions(1);

        const rawEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            new_reserve_0: "1000",
            new_reserve_1: "2000",
            timestamp: 456,
            topic1: "SoroswapPair",
            topic2: "sync",
        } as RawPairSyncEvent;

        const expectedEvent: PairSyncEvent = {
            contractId: "CONTRACT123",
            contractType: "SoroswapPair",
            eventType: "sync",
            ledger: 123,
            newReserveOfFirstToken: 1000n,
            newReserveOfSecondToken: 2000n,
            timestamp: 456,
        };

        expect(parsePairEvent(rawEvent)).toStrictEqual(expectedEvent);
    });

    it("correctly parses a withdraw event", () => {
        expect.assertions(1);

        const rawEvent = {
            amount_0: "100",
            amount_1: "200",
            contractId: "CONTRACT123",
            ledger: 123,
            liquidity: "150",
            new_reserve_0: "900",
            new_reserve_1: "800",
            timestamp: 456,
            to: "RECIPIENT456",
            topic1: "SoroswapPair",
            topic2: "withdraw",
        } as RawPairWithdrawEvent;

        const expectedEvent: PairWithdrawEvent = {
            amountOfFirstTokenWithdrawn: 100n,
            amountOfSecondTokenWithdrawn: 200n,
            contractId: "CONTRACT123",
            contractType: "SoroswapPair",
            eventType: "withdraw",
            ledger: 123,
            liquidityPoolTokensBurned: 150n,
            newReserveOfFirstToken: 900n,
            newReserveOfSecondToken: 800n,
            recipientAddress: "RECIPIENT456",
            timestamp: 456,
        };

        expect(parsePairEvent(rawEvent)).toStrictEqual(expectedEvent);
    });
});
