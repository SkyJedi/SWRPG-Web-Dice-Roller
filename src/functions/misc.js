const seedrandom = require('seedrandom');
var rng = seedrandom('added entropy.', { entropy: true });

function cryptoDice(sides) {
  return Math.floor(rng() * sides) + 1;
}

module.exports = {
    dice:cryptoDice
};
