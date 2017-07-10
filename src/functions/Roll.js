
function roll(diceRoll, polyhedralValue, caption, user) {
  var rollResults = {};

  //build object that contains {color: # of die rolled} and removes all non rolled die
  Object.keys(diceRoll).forEach((color)=>{
    if (diceRoll[color] === 0) delete diceRoll[color];
  });

  //return if no die rolled
  if (Object.keys(diceRoll).length === 0) return 0;

  //Roll the colored dice and add the extra symbols
  rollResults = rollDicePool(diceRoll);

  //count symbols and build message results
  rollResults.text = `<span> ${user} rolled </span>`;
  rollResults = countSymbols(rollResults, user);

  //polyhedral
  if (diceRoll['polyhedral'] > 0) rollResults = rollPolyhedral(rollResults, diceRoll, polyhedralValue);

  //add the caption in
  if (caption !== '') {
    rollResults.caption = caption;
    rollResults.text += `<span> ${caption} </span>`;
  }
  return rollResults;
}

function rollDicePool(diceRoll) {
  let rollResults = {};
  let diceFaces = {
            yellow: ['', 's', 's', 'ss', 'ss', 'a', 'sa', 'sa', 'sa', 'aa', 'aa', '!s'],
            green: ['', 's', 's', 'ss', 'a', 'a', 'sa', 'aa'],
            blue: ['', '', 's', 'sa', 'aa', 'a'],
            red: ['', 'f', 'f', 'ff', 'ff', 't', 't', 'ft', 'ft', 'tt', 'tt', 'df'],
            purple: ['', 'f', 'ff', 't', 't', 't', 'tt', 'ft'],
            black: ['', '', 'f', 'f', 't', 't'],
            white: ['n', 'n', 'n', 'n', 'n', 'n', 'nn', 'l', 'l', 'll', 'll', 'll'],
            success: 's',
            advantage: 'a',
            triumph: '!s',
            fail: 'f',
            threat: 't',
            despair: 'df',
            lightside: 'l',
            darkside: 'n',
          };
  //roll dice and match them to a side and add that face to the message
  Object.keys(diceFaces).forEach((color)=>{
    if (diceRoll[color] === undefined) return;
    rollResults[color] = [];
    for (var k = 0; k < diceRoll[color]; k++) {
        if (color === 'yellow' || color === 'green' ||  color === 'blue' ||  color === 'red' ||  color === 'purple' ||  color === 'black' || color === 'white') rollResults[color].push(diceFaces[color][(Math.floor(Math.random() * diceFaces[color].length) + 1)-1]);
        else rollResults[color].push(diceFaces[color]);
      }
  })
  return rollResults;
}

function rollPolyhedral(rollResults, diceRoll, polyhedralValue) {
  let polyhedral = []
  for(var n = 0; n < diceRoll['polyhedral']; n++) {
    let polyhedralRoll = Math.floor(Math.random() * polyhedralValue + 1);
    polyhedral.push([polyhedralValue, polyhedralRoll]);
    rollResults.text += '<span> (D' + polyhedralValue + '): '  + polyhedralRoll + ' </span>';
  }
  rollResults.polyhedral = polyhedral;
  return rollResults;
}

function countSymbols(rollResults, user) {
  let symbolOrder = ['s', 'a', '!', 'f', 't', 'd', 'l', 'n'];
  let sides = '';
  let diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white', 'success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside'];
  diceOrder.forEach((color)=> {
    if (rollResults[color] === undefined) return;
      rollResults[color].forEach((face)=> {
        sides += face;
        if (color === 'yellow' || color === 'green' ||  color === 'blue' ||  color === 'red' ||  color === 'purple' ||  color === 'black' || color === 'white') rollResults.text += `<img class=diceface src=/images/dice/${color}-${face}.png /> `;
        else rollResults.text += `<img class=diceface src=/images/${color}.png /> `;
      });
  });
  if (sides === '') return rollResults;
  let rolledSymbols = {};
  symbolOrder.forEach((symbol)=>{
    rolledSymbols[symbol] = 0;
    for(var m=0; sides.length > m; m++){
      if(sides.charAt(m) === symbol) rolledSymbols[symbol]++;
    }
  });
  rollResults.rolledSymbols = rolledSymbols;
  rollResults.text += printSymbolMessage(rolledSymbols);
  return rollResults;
}

function printSymbolMessage(rolledSymbols) {
  let number = 0;
  let symbolMessage = ''
  let tooltip = '';
  if (rolledSymbols['s'] > rolledSymbols['f']) {
    number = rolledSymbols['s'] - rolledSymbols['f'];
    if (number !== 0) {tooltip += number + '-Success_';}
    symbolMessage += printsymbols(number, 'success');
  } else {
    number = rolledSymbols['f'] - rolledSymbols['s'];
    if (number !== 0) {tooltip += number + '-Failure_';}
    symbolMessage += printsymbols(number, 'fail');
  }
  if (rolledSymbols['a'] > rolledSymbols['t']) {
    number = rolledSymbols['a'] - rolledSymbols['t'];
    if (number !== 0) {tooltip += number + '-Advantage_';}
    symbolMessage += printsymbols(number, 'advantage');
  } else {
    number = rolledSymbols['t'] - rolledSymbols['a'];
    if (number !== 0) {tooltip += number + '-Threat_';}
    symbolMessage += printsymbols(number, 'threat');
  }
  if (rolledSymbols['!'] !== 0) {
    number = rolledSymbols['!'];
    tooltip += number + '-Triumph_';
    symbolMessage += printsymbols(number, 'triumph');
  }
  if (rolledSymbols['d'] !== 0) {
    number = rolledSymbols['d'];
    tooltip += number + '-Despair_';
    symbolMessage += printsymbols(number, 'despair');
  }
  if (rolledSymbols['l'] !== 0) {
    number = rolledSymbols['l'];
    tooltip += number + '-Lightside_';
    symbolMessage += printsymbols(number, 'lightside');
  }
  if (rolledSymbols['n'] !== 0) {
    number = rolledSymbols['n'];
    tooltip += number + '-Darkside_';
    symbolMessage += printsymbols(number, 'darkside');
  }
  tooltip = tooltip.slice(0, -1);
  if (symbolMessage === '') symbolMessage = 'All dice have cancelled out';
  symbolMessage = `<br><span title=${tooltip}>` + symbolMessage + `</span>`;
  return symbolMessage;
}

function printsymbols (number, symbol) {
  let text =''
  for (var n = 0; number > n; n++){
    text += `<img class=diceface src=/images/${symbol}.png /> `;
  }
  return text;
}

module.exports = {
    roll: roll,
    rollDicePool: rollDicePool,
    rollPolyhedral: rollPolyhedral,
    countSymbols: countSymbols,
};
