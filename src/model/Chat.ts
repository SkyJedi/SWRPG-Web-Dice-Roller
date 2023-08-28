import { Symbol } from "./Symbol";

export class Chat {
    constructor(public text: string, public entries?: Entry[]) {
        if (text === undefined || text === null || text.trim().length <= 0) {
            throw new Error(`Legacy text for a chat must be set but was '${text}'`);
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

export class LinkEntry implements Entry {
    constructor(public text: string, public url: string) {
        if (text === undefined || text === null || text.length <= 0) {
            throw new Error(`Text for an entry must be set but was '${text}'`);
        }
        if (url === undefined || url === null || url.length <= 0) {
            throw new Error(`URL for an entry must be set but was '${url}'`);
        }
    }
}