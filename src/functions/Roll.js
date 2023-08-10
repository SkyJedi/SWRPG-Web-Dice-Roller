import { dice as diceFaces } from './diceFaces.js';
import { dice } from "./misc.js";

export function roll(originalDiceRoll, polyhedralValue, caption, user) {
  let diceRoll = Object.assign({}, originalDiceRoll);
  let diceResult = { roll: { polyhedral: [] }, results: {}, text: '' };
  //build object that contains {color: # of die rolled} and removes all non rolled die
  Object.keys(diceRoll).forEach((color) => {
    if (diceRoll[color] === 0) delete diceRoll[color];
  });

  //return if no die rolled
  if (Object.keys(diceRoll).length === 0) return 0;

  //Roll the colored dice and add the extra symbols\
  Object.keys(diceFaces).forEach((color) => {
    if (!(diceRoll[color] === undefined)) {
      diceResult.roll[color] = [];
      for (var k = 0; k < diceRoll[color]; k++) {
        diceResult.roll[color].push(rollDice(color));
      }
    }
  });

  //polyhedral
  if (diceRoll['polyhedral'] > 0) diceResult.roll.polyhedral = rollPolyhedral(diceRoll, polyhedralValue);

  //count symbols and build message results
  diceResult.text = `<span> ${user} rolled </span>`;
  diceResult = countSymbols(diceResult, user);

  //add the caption in
  if (caption !== '') {
    diceResult.caption = caption;
    diceResult.text += `<span> ${caption} </span>`;
  }
  return diceResult;
}

export function rollDice(die) {
  //roll dice and match them to a side and add that face to the message
  return dice(Object.keys(diceFaces[die]).length);
}

export function rollPolyhedral(diceRoll, polyhedralValue) {
  let polyhedral = []
  for (var n = 0; n < diceRoll['polyhedral']; n++) {
    polyhedral.push([polyhedralValue, dice(polyhedralValue)]);
  }
  return polyhedral;
}

export function countSymbols(diceResult, user) {
  diceResult.results = {
    face: '',
    success: 0,
    advantage: 0,
    triumph: 0,
    failure: 0,
    threat: 0,
    despair: 0,
    lightside: 0,
    darkside: 0,
  }
  if (diceResult.roll.polyhedral !== undefined) diceResult.results.polyhedral = diceResult.roll.polyhedral;
  Object.keys(diceFaces).forEach((color) => {
    if (!(diceResult.roll[color] === undefined)) {
      diceResult.roll[color].forEach((number) => {
        let face = diceFaces[color][number].face;
        for (let i = 0; face.length > i; i++) {
          switch (face[i]) {
            case 's':
              diceResult.results.success++
              break;
            case 'a':
              diceResult.results.advantage++
              break;
            case 'r':
              diceResult.results.triumph++
              diceResult.results.success++
              break;
            case 'f':
              diceResult.results.failure++
              break;
            case 't':
              diceResult.results.threat++
              break;
            case 'd':
              diceResult.results.despair++
              diceResult.results.failure++
              break;
            case 'l':
              diceResult.results.lightside++
              break;
            case 'n':
              diceResult.results.darkside++
              break;
            default:
              break;
          }
        }
        if (color === 'yellow' || color === 'green' || color === 'blue' || color === 'red' || color === 'purple' || color === 'black' || color === 'white') diceResult.text += `<img class=diceface src=/images/dice/${color}-${face}.png /> `;
        else diceResult.text += `<img class=diceface src=/images/${color}.png /> `;
      });
    }
  });
  diceResult.text += printResults(diceResult.results);
  return diceResult;
}

function printResults(diceResult) {
  let response = '';
  let tooltip = '';
  //prints faces
  //creates finalCount by cancelling results
  let finalCount = {};
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
      response += printsymbols(symbol, finalCount[symbol]) + ' ';
      tooltip += finalCount[symbol] + `-${symbol}_`;
    }
  });

  //print polyhedral dice if present
  if (diceResult.polyhedral !== undefined) {
    diceResult.polyhedral.forEach((poly) => {
      response += '<span> (D' + poly[0] + '): ' + poly[1] + ' </span>';
    });
  }

  //null response if everything cancels
  if (response === '') response += 'All dice have cancelled out';
  response = `<br><span title=${tooltip.slice(0, -1)}>` + response + `</span>`;

  return response;
}

function printsymbols(symbol, number) {
  let print = '';
  for (let i = 0; i < number; i++) {
    print += `<img class=diceface src=/images/${symbol}.png /> `
  }
  return print;
}
