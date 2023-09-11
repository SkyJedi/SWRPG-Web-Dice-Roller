
import { DiceResult } from "./DiceResult";
import { DiceRoll } from "./DiceRoll";
import { Entry, Message, SeparatorEntry, SymbolEntry, TextEntry } from "./Message";
import { MessageTransformer } from "./MessageTransformer";
import { Symbol } from "./Symbol";

export class LegacyMessageTransformer {
    constructor(private messageTransformer: MessageTransformer) {
    }

    public toMessage(text: string, roll?: DiceRoll, caption?: string, results?: DiceResult, description?: string, expanded?: boolean): Message {

        let segments = text.split(/(<[^>]+>)/);

        let entries: Entry[];

        if (roll) {
            if (description) {
                entries = this.messageTransformer.fromRoll(description, roll, caption, results, expanded);
            } else {
                for (const segment of segments) {
                    if (segment.length > 0 && !segment.startsWith('<')) {
                        entries = this.messageTransformer.fromRoll(segment, roll, caption, results, expanded);
                        break;
                    }
                }
            }
        } else {
            entries = LegacyMessageTransformer.toMessageFromLegacyText(segments);
        }

        return new Message(text, entries, roll, caption, results);
    }



    private static toMessageFromLegacyText(segments: string[]): Entry[] {
        let result: Entry[] = [];

        segments.forEach(segment => {
            let symbolMatch = segment.match(/^<img .*src=['"]?\/images\/([^.]+)\.png['"]? .*\/>$/);
            let separatorMatch = segment.match(/^<br>|<\/?p>$/);

            if (symbolMatch && symbolMatch.length > 0) {
                let symbol = symbolMatch[1] as keyof typeof Symbol;
                const typedSymbol = Symbol[symbol];
                result.push(new SymbolEntry(typedSymbol));
            } else if (separatorMatch && separatorMatch.length > 0) {
                if (result.length > 0 && !(result.at(-1) instanceof SeparatorEntry)) {
                    // never start with a separator and never have two consecutive separators
                    result.push(new SeparatorEntry());
                }
            } else if (segment.length > 0 && !segment.startsWith('<')) {
                // and never end with a separator
                result.push(new TextEntry(segment));
            }
        });

        if (result.at(-1) instanceof SeparatorEntry) {
            result.pop();
        }

        return result;
    }
}