import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_DIR = join(__dirname, '..', 'data', 'v2', 'csv');
const OUT_DIR = join(__dirname, '..', 'public');

// --- CSV Parser ---
function parseCSV(filename) {
  const raw = readFileSync(join(CSV_DIR, filename), 'utf-8');
  const lines = raw.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function int(val) {
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

// --- Load all CSVs ---
console.log('Loading CSV files...');

const speciesNames = parseCSV('pokemon_species_names.csv');
const species = parseCSV('pokemon_species.csv');
const pokemon = parseCSV('pokemon.csv');
const pokemonTypes = parseCSV('pokemon_types.csv');
const typeNames = parseCSV('type_names.csv');
const pokemonAbilities = parseCSV('pokemon_abilities.csv');
const abilityNames = parseCSV('ability_names.csv');
const pokemonStats = parseCSV('pokemon_stats.csv');
const stats = parseCSV('stats.csv');
const pokemonMoves = parseCSV('pokemon_moves.csv');
const moveNames = parseCSV('move_names.csv');
const pokemonEvolution = parseCSV('pokemon_evolution.csv');

console.log('CSV files loaded. Building lookup maps...');

// --- Build lookup maps (English only, local_language_id=9) ---
const englishSpeciesNames = new Map();
const englishGenus = new Map();
for (const row of speciesNames) {
  if (row.local_language_id === '9') {
    englishSpeciesNames.set(int(row.pokemon_species_id), row.name);
    englishGenus.set(int(row.pokemon_species_id), row.genus);
  }
}

const typeNameMap = new Map();
for (const row of typeNames) {
  if (row.local_language_id === '9') {
    typeNameMap.set(int(row.type_id), row.name);
  }
}

const abilityNameMap = new Map();
for (const row of abilityNames) {
  if (row.local_language_id === '9') {
    abilityNameMap.set(int(row.ability_id), row.name);
  }
}

const moveNameMap = new Map();
for (const row of moveNames) {
  if (row.local_language_id === '9') {
    moveNameMap.set(int(row.move_id), row.name);
  }
}

const statNameMap = new Map();
for (const row of stats) {
  statNameMap.set(int(row.id), row.identifier);
}

// --- Species map ---
const speciesMap = new Map();
for (const row of species) {
  const id = int(row.id);
  if (id && id <= 1025) {
    speciesMap.set(id, {
      id,
      identifier: row.identifier,
      generation_id: int(row.generation_id),
      evolves_from_species_id: int(row.evolves_from_species_id),
      evolution_chain_id: int(row.evolution_chain_id),
      is_legendary: row.is_legendary === '1',
      is_mythical: row.is_mythical === '1',
    });
  }
}

// --- Default pokemon map (species_id -> pokemon_id for is_default=1) ---
const defaultPokemonId = new Map();
for (const row of pokemon) {
  if (row.is_default === '1') {
    const speciesId = int(row.species_id);
    if (speciesId && speciesId <= 1025) {
      defaultPokemonId.set(speciesId, int(row.id));
    }
  }
}

// --- Types per pokemon ---
const typesPerPokemon = new Map();
for (const row of pokemonTypes) {
  const pid = int(row.pokemon_id);
  if (!typesPerPokemon.has(pid)) typesPerPokemon.set(pid, []);
  typesPerPokemon.get(pid).push({ type_id: int(row.type_id), slot: int(row.slot) });
}

// --- Abilities per pokemon ---
const abilitiesPerPokemon = new Map();
for (const row of pokemonAbilities) {
  const pid = int(row.pokemon_id);
  if (!abilitiesPerPokemon.has(pid)) abilitiesPerPokemon.set(pid, []);
  abilitiesPerPokemon.get(pid).push({
    ability_id: int(row.ability_id),
    is_hidden: row.is_hidden === '1',
    slot: int(row.slot),
  });
}

// --- Stats per pokemon ---
const statsPerPokemon = new Map();
for (const row of pokemonStats) {
  const pid = int(row.pokemon_id);
  if (!statsPerPokemon.has(pid)) statsPerPokemon.set(pid, []);
  statsPerPokemon.get(pid).push({
    stat_id: int(row.stat_id),
    base_stat: int(row.base_stat),
  });
}

// --- Moves per pokemon (level-up only, method_id=1) ---
console.log('Processing moves (this may take a moment)...');
const movesPerPokemon = new Map();
for (const row of pokemonMoves) {
  if (row.pokemon_move_method_id !== '1') continue;
  const pid = int(row.pokemon_id);
  if (!movesPerPokemon.has(pid)) movesPerPokemon.set(pid, []);
  movesPerPokemon.get(pid).push({
    move_id: int(row.move_id),
    version_group_id: int(row.version_group_id),
    level: int(row.level),
  });
}

// --- Evolution data ---
const evolutionByEvolvedSpecies = new Map();
for (const row of pokemonEvolution) {
  const evolvedId = int(row.evolved_species_id);
  if (evolvedId) {
    evolutionByEvolvedSpecies.set(evolvedId, {
      minimum_level: int(row.minimum_level),
      trigger_id: int(row.evolution_trigger_id),
    });
  }
}

// --- Build evolution chains ---
// Group species by evolution_chain_id
const chainMembers = new Map();
for (const [id, sp] of speciesMap) {
  const chainId = sp.evolution_chain_id;
  if (!chainId) continue;
  if (!chainMembers.has(chainId)) chainMembers.set(chainId, []);
  chainMembers.get(chainId).push(sp);
}

function buildEvolutionChain(speciesId) {
  const sp = speciesMap.get(speciesId);
  if (!sp || !sp.evolution_chain_id) return [{ id: speciesId, name: englishSpeciesNames.get(speciesId) || 'Unknown' }];

  const members = chainMembers.get(sp.evolution_chain_id) || [];
  if (members.length === 0) return [{ id: speciesId, name: englishSpeciesNames.get(speciesId) || 'Unknown' }];

  // Build tree
  const chain = [];
  for (const m of members) {
    const entry = {
      id: m.id,
      name: englishSpeciesNames.get(m.id) || m.identifier,
    };

    if (m.evolves_from_species_id) {
      entry.evolves_from = m.evolves_from_species_id;
      const evo = evolutionByEvolvedSpecies.get(m.id);
      if (evo) {
        if (evo.minimum_level) {
          entry.min_level = evo.minimum_level;
        }
      }
    }

    chain.push(entry);
  }

  // Sort: root first, then by id
  chain.sort((a, b) => {
    if (!a.evolves_from && b.evolves_from) return -1;
    if (a.evolves_from && !b.evolves_from) return 1;
    return a.id - b.id;
  });

  return chain;
}

// --- Get best moves for a pokemon ---
function getBestMoves(pokemonId) {
  const allMoves = movesPerPokemon.get(pokemonId);
  if (!allMoves || allMoves.length === 0) return [];

  // Find the highest version_group_id
  let maxVG = 0;
  for (const m of allMoves) {
    if (m.version_group_id > maxVG) maxVG = m.version_group_id;
  }

  // Get all moves from that VG
  const vgMoves = allMoves.filter(m => m.version_group_id === maxVG);

  // Deduplicate by move_id, keeping lowest level
  const moveMap = new Map();
  for (const m of vgMoves) {
    const existing = moveMap.get(m.move_id);
    if (!existing || m.level < existing.level) {
      moveMap.set(m.move_id, m);
    }
  }

  // Sort by level ascending, then by move_id
  const sorted = Array.from(moveMap.values()).sort((a, b) => a.level - b.level || a.move_id - b.move_id);

  return sorted.map(m => ({
    name: moveNameMap.get(m.move_id) || `Move ${m.move_id}`,
    level: m.level,
  }));
}

// --- Build the main data ---
console.log('Building Pokémon data...');

const STAT_KEY_MAP = {
  'hp': 'hp',
  'attack': 'attack',
  'defense': 'defense',
  'special-attack': 'special_attack',
  'special-defense': 'special_defense',
  'speed': 'speed',
};

const pokemonData = {};
let missingCount = 0;

for (let speciesId = 1; speciesId <= 1025; speciesId++) {
  const sp = speciesMap.get(speciesId);
  if (!sp) {
    console.warn(`  WARNING: Species ${speciesId} not found in species map`);
    missingCount++;
    continue;
  }

  const pokemonId = defaultPokemonId.get(speciesId) || speciesId;
  const name = englishSpeciesNames.get(speciesId);
  const genus = englishGenus.get(speciesId);

  if (!name) {
    console.warn(`  WARNING: No English name for species ${speciesId}`);
  }

  // Types
  const rawTypes = typesPerPokemon.get(pokemonId) || [];
  rawTypes.sort((a, b) => a.slot - b.slot);
  const types = rawTypes.map(t => typeNameMap.get(t.type_id) || `Type${t.type_id}`);

  // Abilities
  const rawAbilities = abilitiesPerPokemon.get(pokemonId) || [];
  rawAbilities.sort((a, b) => a.slot - b.slot);
  const abilities = rawAbilities.map(a => ({
    name: abilityNameMap.get(a.ability_id) || `Ability${a.ability_id}`,
    is_hidden: a.is_hidden,
  }));

  // Stats
  const rawStats = statsPerPokemon.get(pokemonId) || [];
  const statsObj = {};
  for (const s of rawStats) {
    const statName = statNameMap.get(s.stat_id);
    if (statName && STAT_KEY_MAP[statName]) {
      statsObj[STAT_KEY_MAP[statName]] = s.base_stat;
    }
  }

  // Evolution chain
  const evolutionChain = buildEvolutionChain(speciesId);

  // Moves
  const moves = getBestMoves(pokemonId);

  pokemonData[speciesId] = {
    id: speciesId,
    name: name || sp.identifier,
    genus: genus || '',
    generation: sp.generation_id,
    is_legendary: sp.is_legendary,
    is_mythical: sp.is_mythical,
    types,
    abilities,
    stats: statsObj,
    evolution_chain: evolutionChain,
    moves,
  };
}

// --- Validation ---
console.log('\n--- Validation ---');
const entries = Object.keys(pokemonData);
console.log(`Total entries: ${entries.length}`);

let errors = 0;
for (const [id, p] of Object.entries(pokemonData)) {
  if (!p.name || p.name === '') { console.error(`  Entry ${id}: missing name`); errors++; }
  if (!p.types || p.types.length === 0) { console.error(`  Entry ${id}: missing types`); errors++; }
  if (!p.abilities || p.abilities.length === 0) { console.error(`  Entry ${id}: missing abilities`); errors++; }
  const statKeys = ['hp', 'attack', 'defense', 'special_attack', 'special_defense', 'speed'];
  for (const sk of statKeys) {
    if (p.stats[sk] === undefined || p.stats[sk] === null) {
      console.error(`  Entry ${id} (${p.name}): missing stat ${sk}`);
      errors++;
    }
  }
  if (!p.evolution_chain || p.evolution_chain.length === 0) {
    console.error(`  Entry ${id}: missing evolution chain`);
    errors++;
  }
  if (!p.moves || p.moves.length === 0) {
    console.error(`  Entry ${id} (${p.name}): missing moves`);
    errors++;
  }
}

// Spot checks
const bulbasaur = pokemonData[1];
console.log(`\nSpot check - Bulbasaur: name=${bulbasaur.name}, types=${JSON.stringify(bulbasaur.types)}, hp=${bulbasaur.stats.hp}`);
const pikachu = pokemonData[25];
console.log(`Spot check - Pikachu: name=${pikachu.name}, types=${JSON.stringify(pikachu.types)}`);
const eevee = pokemonData[133];
console.log(`Spot check - Eevee: evolution_chain length=${eevee.evolution_chain.length}, names=${eevee.evolution_chain.map(e => e.name).join(', ')}`);

// Collect unique stats
const allMoveNames = new Set();
for (const p of Object.values(pokemonData)) {
  for (const m of p.moves) allMoveNames.add(m.name);
}
const allChainIds = new Set();
for (const [, sp] of speciesMap) {
  if (sp.evolution_chain_id) allChainIds.add(sp.evolution_chain_id);
}

console.log(`\nUnique moves: ${allMoveNames.size}`);
console.log(`Evolution chains: ${allChainIds.size}`);
console.log(`Validation errors: ${errors}`);

if (entries.length !== 1025) {
  console.error(`\nERROR: Expected 1025 entries, got ${entries.length}`);
  process.exit(1);
}

// --- Write output ---
const output = {
  pokemon: pokemonData,
  meta: {
    total: 1025,
    generated_at: new Date().toISOString(),
    image_base_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/',
  },
};

mkdirSync(OUT_DIR, { recursive: true });
const jsonStr = JSON.stringify(output);
writeFileSync(join(OUT_DIR, 'pokemon-data.json'), jsonStr);
const sizeMB = (Buffer.byteLength(jsonStr) / 1024 / 1024).toFixed(2);
console.log(`\nOutput: public/pokemon-data.json (${sizeMB} MB)`);
console.log('Done!');
