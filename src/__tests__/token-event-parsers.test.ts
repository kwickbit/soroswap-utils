import { describe, expect, it } from "@jest/globals";

import { parsePairEvent } from "../event_parsers/pair";
import type { RawTokenAdminEvent, RawTokenEvent } from "../types";

describe("parsePairEvent", () => {
    it("correctly parses an approve event", () => {
        expect.assertions(1);

        const rawEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            timestamp: 456,
            topic1: "approve",
            topic2: "OWNER123",
            topic3: "SPENDER456",
            topic4: "",
            value: "1000",
        } as RawTokenEvent;

        expect(parsePairEvent(rawEvent)).toStrictEqual({
            amount: 1000n,
            contractId: "CONTRACT123",
            contractType: "SorobanToken",
            eventType: "approve",
            expirationLedger: 1000,
            ledger: 123,
            ownerAddress: "OWNER123",
            spenderAddress: "SPENDER456",
            timestamp: 456,
        });
    });

    it("correctly parses a burn event", () => {
        expect.assertions(1);

        const rawEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            timestamp: 456,
            topic1: "burn",
            topic2: "OWNER123",
            topic3: "",
            topic4: "",
            value: "500",
        } as RawTokenEvent;

        expect(parsePairEvent(rawEvent)).toStrictEqual({
            amount: 500n,
            contractId: "CONTRACT123",
            contractType: "SorobanToken",
            eventType: "burn",
            ledger: 123,
            ownerAddress: "OWNER123",
            timestamp: 456,
        });
    });

    it("correctly parses a clawback event", () => {
        expect.assertions(1);

        const rawEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            timestamp: 456,
            topic1: "clawback",
            topic2: "ADMIN123",
            topic3: "TARGET456",
            topic4: "",
            value: "750",
        } as RawTokenAdminEvent;

        expect(parsePairEvent(rawEvent)).toStrictEqual({
            adminAddress: "ADMIN123",
            amount: 750n,
            contractId: "CONTRACT123",
            contractType: "SorobanToken",
            eventType: "clawback",
            ledger: 123,
            targetAddress: "TARGET456",
            timestamp: 456,
        });
    });

    it("correctly parses a mint event", () => {
        expect.assertions(1);

        const rawEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            timestamp: 456,
            topic1: "mint",
            topic2: "ADMIN123",
            topic3: "RECIPIENT456",
            topic4: "",
            value: "1500",
        } as RawTokenAdminEvent;

        expect(parsePairEvent(rawEvent)).toStrictEqual({
            adminAddress: "ADMIN123",
            amount: 1500n,
            contractId: "CONTRACT123",
            contractType: "SorobanToken",
            eventType: "mint",
            ledger: 123,
            recipientAddress: "RECIPIENT456",
            timestamp: 456,
        });
    });

    it("correctly parses a set_admin event", () => {
        expect.assertions(1);

        const rawEvent: RawTokenAdminEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            timestamp: 456,
            topic1: "set_admin",
            topic2: "ADMIN123",
            topic3: "",
            topic4: "",
            value: "NEWADMIN789",
        };

        expect(parsePairEvent(rawEvent)).toStrictEqual({
            adminAddress: "ADMIN123",
            contractId: "CONTRACT123",
            contractType: "SorobanToken",
            eventType: "set_admin",
            ledger: 123,
            newAdminAddress: "NEWADMIN789",
            timestamp: 456,
        });
    });

    it("correctly parses a set_authorized event", () => {
        expect.assertions(1);

        const rawEvent: RawTokenAdminEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            timestamp: 456,
            topic1: "set_authorized",
            topic2: "ADMIN123",
            topic3: "TARGET456",
            topic4: "",
            value: "1",
        };

        expect(parsePairEvent(rawEvent)).toStrictEqual({
            adminAddress: "ADMIN123",
            contractId: "CONTRACT123",
            contractType: "SorobanToken",
            eventType: "set_authorized",
            isAuthorized: true,
            ledger: 123,
            targetAddress: "TARGET456",
            timestamp: 456,
        });
    });

    it("correctly parses a transfer event", () => {
        expect.assertions(1);

        const rawEvent: RawTokenEvent = {
            contractId: "CONTRACT123",
            ledger: 123,
            timestamp: 456,
            topic1: "transfer",
            topic2: "SENDER123",
            topic3: "RECIPIENT456",
            topic4: "",
            value: "2000",
        };

        expect(parsePairEvent(rawEvent)).toStrictEqual({
            amount: 2000n,
            contractId: "CONTRACT123",
            contractType: "SorobanToken",
            eventType: "transfer",
            ledger: 123,
            recipientAddress: "RECIPIENT456",
            senderAddress: "SENDER123",
            timestamp: 456,
        });
    });
});
