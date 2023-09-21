import seedrandom from 'seedrandom';
var rng = seedrandom('added entropy.', { entropy: true });

export function dice(sides) {
  return Math.floor(rng() * sides) + 1;
}

export function isNewSessionText(text) {
  return text.match(/^(<span>)?-+(<\/span>)?$/);
}
