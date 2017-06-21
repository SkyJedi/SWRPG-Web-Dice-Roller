
function roll(diceRoll, polyhedralValue, caption, diceOrder, symbols, symbolOrder, user) {
  var diceFaces = {
        yellow: ['', 's', 's', 'ss', 'ss', 'a', 'sa', 'sa', 'sa', 'aa', 'aa', '!s'],
        green: ['', 's', 's', 'ss', 'a', 'a', 'sa', 'aa'],
        blue: ['', '', 's', 'sa', 'aa', 'a'],
        red: ['', 'f', 'f', 'ff', 'ff', 't', 't', 'ft', 'ft', 'tt', 'tt', 'df'],
        purple: ['', 'f', 'ff', 't', 't', 't', 'tt', 'ft'],
        black: ['', '', 'f', 'f', 't', 't'],
        white: ['n', 'n', 'n', 'n', 'n', 'n', 'nn', 'l', 'l', 'll', 'll', 'll']
      },
      symbolFaces = {
        success: 's',
        advantage: 'a',
        triumph: '!s',
        fail: 'f',
        threat: 't',
        despair: 'df',
        lightside: 'l',
        darkside: 'n'
      },
      rollResults = {},
      rolledDice = {},
      message = '',
      sides = '',
      rolledSymbols = {},
      polyhedralRoll = [];

    for (var i = 0; i < Object.keys(diceRoll).length; i++) {
      if (diceRoll[Object.keys(diceRoll)[i]] !== 0) {
        rolledDice[Object.keys(diceRoll)[i]] = Object.values(diceRoll)[i];
      }
    }

    if (Object.keys(rolledDice).length === 0) {
      return 0;
    }

    message += `<span> ${user} rolled </span>`;

    var color = '';
    for (var j = 0; j < Object.keys(diceFaces).length; j++) {
      color = diceOrder[j];
      var tempArry = [];
      for (var k = 0; k < rolledDice[color]; k++) {
          var diceSide = diceFaces[color][(Math.floor(Math.random() * diceFaces[color].length) + 1)-1]
          tempArry.push(diceSide);
          sides += diceSide
          message += `<img class=diceface src=/images/dice/${color}-${diceSide}.png /> `;
      }
      rollResults[color] = tempArry;
    }

    for (var o = 0; o < Object.keys(symbolFaces).length; o++) {
      color = symbols[o];
      tempArry = [];
      for (var p = 0; p < rolledDice[color]; p++) {
          tempArry.push(symbolFaces[color]);
          sides += symbolFaces[color];
          message += `<img class=diceface src=/images/${color}.png /> `;
      }
      rollResults[color] = tempArry;
    }

    for(var n = 0; n < rolledDice['polyhedral']; n++) {
      polyhedralRoll.push(Math.floor(Math.random() * polyhedralValue + 1));
      message += '<span> (D' + polyhedralValue + '): '  + polyhedralRoll[n] + ' </span>';
    }

    for(var l=0; symbolOrder.length > l; l++){
      var count = 0;
      for(var m=0; sides.length > m; m++){
        if(sides.charAt(m) === symbolOrder[l]){
        ++count;
        }
      }
      rolledSymbols[symbolOrder[l]] = count;
    }
    var number = 0;
    var symbolMessage = ''
    var tooltip = '';
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
    if (symbolMessage === '') {symbolMessage = 'All dice have cancelled out'}
    message += `<br><span title=${tooltip}>` + symbolMessage + `</span>`;

    if (caption !== '') {
      message += `<span> ${caption} </span>`;
    }
    return [message, rollResults, rolledSymbols];
  }

  function printsymbols (number, symbol) {
    var message = '';
      for (var n = 0; number > n; n++){
        message += `<img class=diceface src=/images/${symbol}.png /> `;
      }
      return message;
  }

module.exports = {
    roll: roll,
    printsymbols: printsymbols,
};
