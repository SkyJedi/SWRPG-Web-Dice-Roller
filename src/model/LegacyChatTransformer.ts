import { Chat, Entry, LinkEntry, SymbolEntry, TextEntry } from "./Chat";
import { Symbol } from "./Symbol";

export class LegacyChatTransformer {

    public toChat(text: string): Chat {
        let segments = text.split(/(<[^>]+>)/);
        let entries: Entry[] = LegacyChatTransformer.toMessageFromLegacyText(segments);

        return new Chat(text, entries);
    }

    private static toMessageFromLegacyText(segments: string[]): Entry[] {
        let result: Entry[] = [];

        for (var i = 0; i < segments.length; i++) {
            const segment = segments[i];

            let symbolMatch = segment.match(/^<img .*src=['"]?\/images\/([^.]+)\.png['"]? .*\/>$/);
            let linkMatch = segment.match(/^<a .*href=["']([^"']+)["'].*>$/);

            if (symbolMatch && symbolMatch.length > 0) {
                let symbol = symbolMatch[1] as keyof typeof Symbol;
                const typedSymbol = Symbol[symbol];
                result.push(new SymbolEntry(typedSymbol));
            } else if (linkMatch && linkMatch.length > 0 && segments.length > i + 1) {
                const nextSegment = segments[++i];
                result.push(new LinkEntry(nextSegment, linkMatch[1]));
            } else if (segment.length > 0 && !segment.startsWith('<')) {
                // and never end with a separator
                result.push(new TextEntry(segment));
            }
        }

        return result;
    }
}