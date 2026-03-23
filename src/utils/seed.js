import { WORDLIST } from './wordlist.js';

export function generatePhrase() {
  const words = [];
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * WORDLIST.length);
    words.push(WORDLIST[index]);
  }
  return words.join(' ');
}

export function validateWord(word) {
  return WORDLIST.includes(word.toLowerCase().trim());
}

export function hashSeed(phrase) {
  let hash = 0;
  for (let i = 0; i < phrase.length; i++) {
    const char = phrase.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function seededShuffle(array, phrase) {
  const rng = mulberry32(hashSeed(phrase));
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getQuizPokemon(phrase, count) {
  const ids = Array.from({ length: 1025 }, (_, i) => i + 1);
  return seededShuffle(ids, phrase).slice(0, count);
}
