import { describe, expect, it } from '@jest/globals';

import { LinkEntry, SymbolEntry, TextEntry } from '../Chat';
import { LegacyChatTransformer } from '../LegacyChatTransformer';
import { Symbol } from '../Symbol';

describe("Testing LegacyChatTransformer", () => {
    let classUnderTest: LegacyChatTransformer;

    beforeEach(() => {
        classUnderTest = new LegacyChatTransformer();
    });

    it("correctly recognizes symbol image tags", () => {
        const actual = classUnderTest.toChat("lalala <img class=tinydie src=/images/black.png /> <img src=/images/blue.png alt='' style=max-width:15px /> lololo");
        expect(actual.entries).toStrictEqual([
            new TextEntry("lalala "),
            new SymbolEntry(Symbol.black),
            new TextEntry(" "),
            new SymbolEntry(Symbol.blue),
            new TextEntry(" lololo")
        ]);
    });

    it("correctly recognizes hyperlink tags", () => {
        const actual = classUnderTest.toChat(`lalala <a href="some url" style="font-size: small">some link text</a><img src=/images/black.png /> <img src=/images/blue.png alt='' style=max-width:15px /> lololo`);
        expect(actual.entries).toStrictEqual([
            new TextEntry("lalala "),
            new LinkEntry("some link text", "some url"),
            new SymbolEntry(Symbol.black),
            new TextEntry(" "),
            new SymbolEntry(Symbol.blue),
            new TextEntry(" lololo")
        ]);
    });

    it("correctly recognizes text tags", () => {
        const actual = classUnderTest.toChat("<p>lalala</p>and then<br><p>with <span>more</span> lololo</p>");
        expect(actual.entries).toStrictEqual([
            new TextEntry("lalala"),
            new TextEntry("and then"),
            new TextEntry("with "),
            new TextEntry("more"),
            new TextEntry(" lololo")
        ]);
    });
});