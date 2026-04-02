export const TYPE_COLORS = {
  Normal: '#A8A77A',
  Fire: '#EE8130',
  Water: '#6390F0',
  Electric: '#F7D02C',
  Grass: '#7AC74C',
  Ice: '#96D9D6',
  Fighting: '#C22E28',
  Poison: '#A33EA1',
  Ground: '#E2BF65',
  Flying: '#A98FF3',
  Psychic: '#F95587',
  Bug: '#A6B91A',
  Rock: '#B6A136',
  Ghost: '#735797',
  Dragon: '#6F35FC',
  Dark: '#705746',
  Steel: '#B7B7CE',
  Fairy: '#D685AD',
};

export const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  special_attack: 'Sp. Atk',
  special_defense: 'Sp. Def',
  speed: 'Speed',
};

export const STAT_COLORS = {
  hp: '#FF5959',
  attack: '#F5AC78',
  defense: '#FAE078',
  special_attack: '#9DB7F5',
  special_defense: '#A7DB8D',
  speed: '#FA92B2',
};

export const QUIZ_COUNTS = [5, 10, 20, 50];

export const GENERATION_NAMES = {
  1: 'Gen I — Kanto',
  2: 'Gen II — Johto',
  3: 'Gen III — Hoenn',
  4: 'Gen IV — Sinnoh',
  5: 'Gen V — Unova',
  6: 'Gen VI — Kalos',
  7: 'Gen VII — Alola',
  8: 'Gen VIII — Galar',
  9: 'Gen IX — Paldea',
};

const base = import.meta.env.BASE_URL;
export const IMAGE_FULL_URL = `${base}images/full/`;
export const IMAGE_THUMB_URL = `${base}images/thumb/`;
