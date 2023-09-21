import { rollDice, rollPolyhedral } from "./Roll.js";
import { dice } from "./misc.js";

export function increaseDice(modifiedRoll, diceResult, color, polyhedral) {

  if (diceResult === undefined) diceResult = [];
  if (color === 'polyhedral') {
    diceResult = diceResult.concat(rollPolyhedral({ polyhedral: modifiedRoll }, polyhedral));
  }
  else {
    for (let i = 0; modifiedRoll > i; i++) {
      diceResult.push(rollDice(color));
    }
  }
  console.log(diceResult);
  return diceResult;
}

export function decreaseDice(modifiedRoll, diceResult) {
  if (modifiedRoll + diceResult.length === 0) {
    diceResult.length = 0;
  } else {
    for (var i = 0; i > modifiedRoll; i--) {
      diceResult.splice(dice(diceResult.length) - 1, 1)
    }
  }
  return diceResult;
}
