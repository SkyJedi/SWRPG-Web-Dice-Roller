import { dice as diceFaces } from '../functions/diceFaces.js';
import { DiceResult } from "./DiceResult.js";
import { DiceRoll } from "./DiceRoll.js";
import { Entry, SeparatorEntry, SymbolEntry, TextEntry } from "./Message";
import { Symbol } from './Symbol';

export class MessageTransformer {

    public fromRoll(description: string, roll: DiceRoll, caption?: string, results?: DiceResult): Entry[] {
        let result: Entry[] = [];

        result.push(new TextEntry(description));
        MessageTransformer.rollToEntries(roll, result);
        result.push(new SeparatorEntry());
        MessageTransformer.resultsToEntries(results, result);

        if (caption) {
            result.push(new SeparatorEntry());
            result.push(new SeparatorEntry());
            result.push(new TextEntry(caption));
        }

        return result;
    }

    private static rollToEntries(roll: DiceRoll, result: Entry[]) {
        Object.keys(diceFaces)
            .filter(color => roll[color] !== undefined)
            .forEach((color) => {
                roll[color].forEach((number: number) => {
                    let face = diceFaces[color][number].face;
                    if (color === 'yellow' || color === 'green' || color === 'blue' || color === 'red' || color === 'purple' || color === 'black' || color === 'white') {
                        result.push(new SymbolEntry(Symbol[`dice/${color}-${face}`]));
                    } else {
                        result.push(new SymbolEntry(Symbol[color]));
                    }
                });
            });
    }


    private static resultsToEntries(diceResult: DiceResult, result: Entry[]) {
        //prints faces
        //creates finalCount by cancelling results
        let finalCount: any = {};
        if (diceResult.success > diceResult.failure) finalCount.success = diceResult.success - diceResult.failure;
        if (diceResult.failure > diceResult.success) finalCount.failure = diceResult.failure - diceResult.success;
        if (diceResult.advantage > diceResult.threat) finalCount.advantage = diceResult.advantage - diceResult.threat;
        if (diceResult.threat > diceResult.advantage) finalCount.threat = diceResult.threat - diceResult.advantage;
        if (diceResult.triumph > 0) finalCount.triumph = diceResult.triumph;
        if (diceResult.despair > 0) finalCount.despair = diceResult.despair;
        if (diceResult.lightside > 0) finalCount.lightside = diceResult.lightside;
        if (diceResult.darkside > 0) finalCount.darkside = diceResult.darkside;

        //prints finalCount
        Object.keys(finalCount).forEach((symbol) => {
            if (finalCount[symbol] !== 0) {
                for (let i = 0; i < finalCount[symbol]; i++) {
                    result.push(new SymbolEntry(Symbol[symbol]));
                }
            }
        });

        //null response if everything cancels
        if (Object.keys(finalCount).length === 0) {
            result.push(new TextEntry('All dice have cancelled out'));
        }

        //print polyhedral dice if present
        if (diceResult.polyhedral !== undefined) {
            diceResult.polyhedral.forEach((poly) => {
                result.push(new SeparatorEntry());
                result.push(new TextEntry(` (D${poly[0]}: ${poly[1]}) `))
            });
        }
    }
}