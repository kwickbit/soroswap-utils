/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import { describe, expect, it } from "@jest/globals";

import { parseFactoryEvent } from "../event_parsers/factory";
import type {
    FactoryFeeDestinationAddressChangedEvent,
    FactoryFeesEnabledEvent,
    FactoryFeeSettingAddressChangedEvent,
    FactoryInitializedEvent,
    FactoryNewPairEvent,
    RawFactoryFeesEvent,
    RawFactoryFeeToEvent,
    RawFactoryInitEvent,
    RawFactoryNewPairEvent,
    RawFactorySetterEvent,
} from "../types";

describe("parseFactoryEvent", () => {
    it("correctly parses a fees event", async () => {
        expect.assertions(1);

        const rawEvent = {
            fees_enabled: true,
            ledger: 123,
            timestamp: 456,
            topic1: "SoroswapFactory",
            topic2: "fees",
        } as RawFactoryFeesEvent;

        const expectedEvent: FactoryFeesEnabledEvent = {
            areFeesEnabledNow: true,
            contractType: "SoroswapFactory",
            eventType: "fees",
            ledger: 123,
            timestamp: 456,
        };

        await expect(parseFactoryEvent(rawEvent)).resolves.toStrictEqual(expectedEvent);
    });

    it("correctly parses a fee_to event", async () => {
        expect.assertions(1);

        const rawEvent = {
            ledger: 123,
            new: "NEW123",
            old: "OLD456",
            setter: "SETTER789",
            timestamp: 456,
            topic1: "SoroswapFactory",
            topic2: "fee_to",
        } as RawFactoryFeeToEvent;

        const expectedEvent: FactoryFeeDestinationAddressChangedEvent = {
            contractType: "SoroswapFactory",
            eventType: "fee_to",
            feeSettingAddress: "SETTER789",
            ledger: 123,
            newFeeDestinationAddress: "NEW123",
            oldFeeDestinationAddress: "OLD456",
            timestamp: 456,
        };

        await expect(parseFactoryEvent(rawEvent)).resolves.toStrictEqual(expectedEvent);
    });

    it("correctly parses an init event", async () => {
        expect.assertions(1);

        const rawEvent = {
            ledger: 123,
            setter: "SETTER123",
            timestamp: 456,
            topic1: "SoroswapFactory",
            topic2: "init",
        } as RawFactoryInitEvent;

        const expectedEvent: FactoryInitializedEvent = {
            contractType: "SoroswapFactory",
            eventType: "init",
            feeSettingAddress: "SETTER123",
            ledger: 123,
            timestamp: 456,
        };

        await expect(parseFactoryEvent(rawEvent)).resolves.toStrictEqual(expectedEvent);
    });

    it("correctly parses a new_pair event", async () => {
        expect.assertions(1);

        const rawEvent = {
            ledger: 123,
            new_pairs_length: 42,
            pair: "PAIR123",
            timestamp: 456,
            token_0: "TOKEN0",
            token_1: "TOKEN1",
            topic1: "SoroswapFactory",
            topic2: "new_pair",
        } as RawFactoryNewPairEvent;

        const expectedEvent: FactoryNewPairEvent = {
            contractType: "SoroswapFactory",
            eventType: "new_pair",

            firstToken: {
                contract: "TOKEN0",
                isSoroswapCertified: false,
            },

            ledger: 123,
            pairAddress: "PAIR123",
            pairIndex: 42,

            secondToken: {
                contract: "TOKEN1",
                isSoroswapCertified: false,
            },

            timestamp: 456,
        };

        await expect(parseFactoryEvent(rawEvent)).resolves.toStrictEqual(expectedEvent);
    });

    it("correctly parses a setter event", async () => {
        expect.assertions(1);

        const rawEvent = {
            ledger: 123,
            new: "NEW123",
            old: "OLD456",
            timestamp: 456,
            topic1: "SoroswapFactory",
            topic2: "setter",
        } as RawFactorySetterEvent;

        const expectedEvent: FactoryFeeSettingAddressChangedEvent = {
            contractType: "SoroswapFactory",
            eventType: "setter",
            ledger: 123,
            newfeeSettingAddress: "NEW123",
            oldfeeSettingAddress: "OLD456",
            timestamp: 456,
        };

        await expect(parseFactoryEvent(rawEvent)).resolves.toStrictEqual(expectedEvent);
    });
});
