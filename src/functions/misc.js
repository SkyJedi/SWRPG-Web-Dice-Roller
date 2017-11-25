const seedrandom = require('seedrandom');
var rng = seedrandom('added entropy.', { entropy: true });

function cryptoDice(sides) {
  let number = Math.floor(rng() * sides) + 1;
  console.log(number)
  return number;
}

module.exports = {
    dice:cryptoDice
};
