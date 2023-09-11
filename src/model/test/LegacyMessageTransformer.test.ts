import { describe, expect, it } from '@jest/globals';
import { DiceResult } from '../DiceResult';
import { DiceRoll } from '../DiceRoll';

import { fn } from 'jest-mock';
import { LegacyMessageTransformer } from '../LegacyMessageTransformer';
import { SeparatorEntry, SymbolEntry, TextEntry } from '../Message';
import { MessageTransformer } from '../MessageTransformer';
import { Symbol } from '../Symbol';

describe("Testing LegacyMessageTransformer", () => {

    const messageTransformerMock: jest.Mocked<MessageTransformer> = {
        fromRoll: fn((description: string, roll: DiceRoll, caption?: string, results?: DiceResult) => [new SeparatorEntry()])
    }

    let classUnderTest: LegacyMessageTransformer;

    beforeEach(() => {
        // Clears the record of calls to the mock constructor function and its methods
        messageTransformerMock.fromRoll.mockClear();
        classUnderTest = new LegacyMessageTransformer(messageTransformerMock);
    });

    it("correctly recognizes symbol image tags", () => {

        const actual = classUnderTest.toMessage("lalala <img class=diceface src=/images/black.png /> <img src=/images/blue.png alt='' style=max-width:15px /> lololo");
        expect(actual.entries).toStrictEqual([
            new TextEntry("lalala "),
            new SymbolEntry(Symbol.black),
            new TextEntry(" "),
            new SymbolEntry(Symbol.blue),
            new TextEntry(" lololo")
        ]);

        expect(actual.roll).toBeUndefined();
        expect(actual.caption).toBeUndefined();
        expect(actual.results).toBeUndefined();

        expect(messageTransformerMock.fromRoll).not.toHaveBeenCalled();
    });

    it("correctly recognizes text tags", () => {
        const actual = classUnderTest.toMessage("<p>lalala</p>and then<br><p>with <span>more</span> lololo</p>");
        expect(actual.entries).toStrictEqual([
            new TextEntry("lalala"),
            new SeparatorEntry(),
            new TextEntry("and then"),
            new SeparatorEntry(),
            new TextEntry("with "),
            new TextEntry("more"),
            new TextEntry(" lololo")
        ]);

        expect(actual.roll).toBeUndefined();
        expect(actual.caption).toBeUndefined();
        expect(actual.results).toBeUndefined();

        expect(messageTransformerMock.fromRoll).not.toHaveBeenCalled();
    });

    it("correctly recognizes a very complex example", () => {
        const actual = classUnderTest.toMessage(
            "<span> test1 rolled </span><img class=diceface src=/images/dice/yellow-ss.png /> <img class=diceface src=/images/dice/green-aa.png /> <span> (D100): 75 </span><span> something </span>");
        expect(actual.entries).toStrictEqual([
            new TextEntry(" test1 rolled "),
            new SymbolEntry(Symbol['dice/yellow-ss']),
            new TextEntry(" "),
            new SymbolEntry(Symbol['dice/green-aa']),
            new TextEntry(" "),
            new TextEntry(" (D100): 75 "),
            new TextEntry(" something ")
        ]);

        expect(actual.roll).toBeUndefined();
        expect(actual.caption).toBeUndefined();
        expect(actual.results).toBeUndefined();

        expect(messageTransformerMock.fromRoll).not.toHaveBeenCalled();
    });

    it("passes through the roll", () => {
        const actual = classUnderTest.toMessage("text", new DiceRoll({ yellow: [7] }));

        expect(messageTransformerMock.fromRoll).toHaveBeenCalledWith("text", new DiceRoll({ yellow: [7] }), undefined, undefined, undefined);
    });

    it("passes through the roll and caption", () => {
        const actual = classUnderTest.toMessage("text", new DiceRoll({ yellow: [7] }), "my caption");

        expect(messageTransformerMock.fromRoll).toHaveBeenCalledWith("text", new DiceRoll({ yellow: [7] }), "my caption", undefined, undefined);
    });

    it("passes through the roll and caption and result", () => {
        const actual = classUnderTest.toMessage("text", new DiceRoll({ yellow: [7] }), "my caption", new DiceResult({ success: 2 }), undefined);

        expect(messageTransformerMock.fromRoll).toHaveBeenCalledWith("text", new DiceRoll({ yellow: [7] }), "my caption", new DiceResult({ success: 2 }), undefined);
    });

    it("passes through the roll and caption and result and description", () => {
        const actual = classUnderTest.toMessage("text", new DiceRoll({ yellow: [7] }), "my caption", new DiceResult({ success: 2 }), "the description");

        expect(messageTransformerMock.fromRoll).toHaveBeenCalledWith("the description", new DiceRoll({ yellow: [7] }), "my caption", new DiceResult({ success: 2 }), undefined);
    });

    it("passes through the expanded flag", () => {
        const actual = classUnderTest.toMessage("text", new DiceRoll({ yellow: [7] }), "my caption", new DiceResult({ success: 2 }), "the description", true);

        expect(messageTransformerMock.fromRoll).toHaveBeenCalledWith("the description", new DiceRoll({ yellow: [7] }), "my caption", new DiceResult({ success: 2 }), true);
    });
});