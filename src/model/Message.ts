import { DiceResult } from "./DiceResult";
import { DiceRoll } from "./DiceRoll";
import { Symbol } from "./Symbol";

export class Message {
    constructor(public text: string, public entries: Entry[], public roll?: DiceRoll, public caption?: string, public results?: DiceResult) {
        if (text === undefined || text === null || text.trim().length <= 0) {
            throw new Error(`Legacy text for a message must be set but was '${text}'`);
        }
        if (entries === undefined || entries === null || entries.length <= 0) {
            throw new Error(`Entries for a message must be set but was '${entries}'`);
        }
    }
}

export interface Entry {
}

export class TextEntry implements Entry {
    constructor(public text: string) {
        if (text === undefined || text === null || text.length <= 0) {
            throw new Error(`Text for an entry must be set but was '${text}'`);
        }
    }
}


export class SymbolEntry implements Entry {
    constructor(public symbol: Symbol) {
        if (symbol === undefined || symbol === null) {
            throw new Error(`Symbol for an entry must be set but was '${symbol}'`);
        }
    }
}

export class SeparatorEntry implements Entry {
}