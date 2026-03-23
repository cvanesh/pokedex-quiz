# PokéDex Quiz — Complete Build Specification

> **Target**: Offline-capable PWA hosted on GitHub Pages at `https://cvanesh.github.io/pokedex-quiz`
> **Builder**: Claude Code (Opus) — execute stage by stage, validate each, report when done.

---

## 1. Project Overview

A two-player Pokémon quiz app where:

- **Player A (Challenger)** starts a quiz, picks how many Pokémon to quiz on (5/10/20/50), and the app generates a 3-word seed phrase (e.g. `drift ember claw`). The app shows one Pokémon image at a time — no name, no details. They guess verbally.
- **Player B (Validator)** opens the app on a different device, enters the same 3-word phrase, and sees the exact same Pokémon in the same order — but with the full answer key: name, types, abilities, base stats, evolution chain, and level-up moves. They mark each guess as correct or incorrect.
- **No server sync** — the seed phrase deterministically generates the same Pokémon sequence on any device.

---

## 2. Data Sources

All data is pre-processed at build time into a single `pokemon-data.json` file. No runtime API calls.

### 2.1 Source Repository: PokeAPI CSV Data

Clone: `https://github.com/PokeAPI/pokeapi.git`

All CSV files are in `/data/v2/csv/`. The relevant files are:

| File | Key Columns | Purpose |
|------|-------------|---------|
| `pokemon_species_names.csv` | `pokemon_species_id, local_language_id, name, genus` | English names (filter `local_language_id=9`) |
| `pokemon_species.csv` | `id, identifier, generation_id, evolves_from_species_id, evolution_chain_id, is_legendary, is_mythical` | Species metadata + evolution chain linkage |
| `pokemon.csv` | `id, identifier, species_id, height, weight, base_experience, is_default` | Base Pokémon records (filter `is_default=1`, `species_id<=1025`) |
| `pokemon_types.csv` | `pokemon_id, type_id, slot` | Type assignments per Pokémon |
| `type_names.csv` | `type_id, local_language_id, name` | English type names (filter `local_language_id=9`) |
| `pokemon_abilities.csv` | `pokemon_id, ability_id, is_hidden, slot` | Ability assignments |
| `ability_names.csv` | `ability_id, local_language_id, name` | English ability names (filter `local_language_id=9`) |
| `pokemon_stats.csv` | `pokemon_id, stat_id, base_stat, effort` | Base stats |
| `stats.csv` | `id, identifier` | Stat ID mapping: 1=hp, 2=attack, 3=defense, 4=special-attack, 5=special-defense, 6=speed |
| `pokemon_moves.csv` | `pokemon_id, version_group_id, move_id, pokemon_move_method_id, level, order` | Move learnsets |
| `move_names.csv` | `move_id, local_language_id, name` | English move names (filter `local_language_id=9`) |
| `pokemon_evolution.csv` | `id, evolved_species_id, evolution_trigger_id, minimum_level, ...` | Evolution conditions |
| `evolution_chains.csv` | `id, baby_trigger_item_id` | Chain IDs |

### 2.2 Images: PokeAPI Sprites (Official Artwork)

**Do NOT bundle images.** Load them at runtime from the GitHub-hosted CDN URL:

```
https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png
```

Where `{id}` is the Pokémon species ID (1–1025), unpadded. Example:
- Bulbasaur: `.../official-artwork/1.png`
- Pikachu: `.../official-artwork/25.png`
- Pecharunt: `.../official-artwork/1025.png`

These are high-quality transparent PNGs of official Sugimori artwork. The service worker will cache them on first view for offline use.

---

## 3. Build Stage 1: Data Pipeline

### 3.1 Build Script

Create `scripts/build-data.js` (Node.js). This script:

1. Reads all CSV files listed above from a local clone of `PokeAPI/pokeapi`.
2. Builds lookup maps for type names, ability names, move names, stat names (all English, `local_language_id=9`).
3. For each species ID from 1 to 1025:
   - Get the English name from `pokemon_species_names.csv`.
   - Get types from `pokemon_types.csv` → resolve to English names.
   - Get abilities from `pokemon_abilities.csv` → resolve to English names, noting `is_hidden`.
   - Get base stats from `pokemon_stats.csv` (stat_ids 1–6 only).
   - Get generation from `pokemon_species.csv`.
   - Build evolution chain (see §3.2).
   - Get level-up moves (see §3.3).
4. Output `public/pokemon-data.json`.

### 3.2 Evolution Chain Construction

For each Pokémon, include its full evolution family:

1. From `pokemon_species.csv`, get the `evolution_chain_id` for this species.
2. Find ALL species sharing that `evolution_chain_id`.
3. Build a tree using `evolves_from_species_id`:
   - Root = the species with no `evolves_from_species_id`.
   - Children = species whose `evolves_from_species_id` matches the root.
   - Grandchildren = species whose `evolves_from_species_id` matches a child.
4. For each evolution step, look up the `pokemon_evolution.csv` entry where `evolved_species_id` matches, to get `minimum_level` (may be null for stone/trade evolutions).
5. Flatten to an array of objects: `[{ id, name, level_or_method }]`.

Example output for Bulbasaur's chain:
```json
"evolution_chain": [
  { "id": 1, "name": "Bulbasaur" },
  { "id": 2, "name": "Ivysaur", "min_level": 16 },
  { "id": 3, "name": "Venusaur", "min_level": 32 }
]
```

For branching evolutions (e.g., Eevee), include all branches as a flat array, each with `evolves_from`:
```json
"evolution_chain": [
  { "id": 133, "name": "Eevee" },
  { "id": 134, "name": "Vaporeon", "evolves_from": 133, "method": "Water Stone" },
  { "id": 135, "name": "Jolteon", "evolves_from": 133, "method": "Thunder Stone" },
  ...
]
```

### 3.3 Moves Strategy

The `pokemon_moves.csv` is massive (500K+ lines). Use this strategy:

- **Only include level-up moves** (`pokemon_move_method_id = 1`).
- **Use the latest version group per Pokémon**. The latest VG varies by Pokémon:
  - VG 29: 151 Pokémon (Gen 9 games)
  - VG 25: 634 Pokémon (Scarlet/Violet)
  - VG 20–24: remaining older Pokémon
- For each Pokémon, find the highest `version_group_id` that has level-up moves, then collect all level-up moves from that VG.
- Deduplicate by `move_id` (a move can appear at multiple levels; keep the lowest level).
- Sort by level ascending.
- Resolve move names from `move_names.csv`.

Output format per Pokémon:
```json
"moves": [
  { "name": "Tackle", "level": 1 },
  { "name": "Growl", "level": 1 },
  { "name": "Vine Whip", "level": 3 },
  ...
]
```

### 3.4 Output Schema

`public/pokemon-data.json`:

```json
{
  "pokemon": {
    "1": {
      "id": 1,
      "name": "Bulbasaur",
      "genus": "Seed Pokémon",
      "generation": 1,
      "is_legendary": false,
      "is_mythical": false,
      "types": ["Grass", "Poison"],
      "abilities": [
        { "name": "Overgrow", "is_hidden": false },
        { "name": "Chlorophyll", "is_hidden": true }
      ],
      "stats": {
        "hp": 45,
        "attack": 49,
        "defense": 49,
        "special_attack": 65,
        "special_defense": 65,
        "speed": 45
      },
      "evolution_chain": [
        { "id": 1, "name": "Bulbasaur" },
        { "id": 2, "name": "Ivysaur", "min_level": 16 },
        { "id": 3, "name": "Venusaur", "min_level": 32 }
      ],
      "moves": [
        { "name": "Tackle", "level": 1 },
        { "name": "Growl", "level": 1 },
        ...
      ]
    },
    "2": { ... },
    ...
    "1025": { ... }
  },
  "meta": {
    "total": 1025,
    "generated_at": "2026-03-23T...",
    "image_base_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"
  }
}
```

### 3.5 Validation

After generating the JSON, the build script must validate:
- Exactly 1025 entries exist.
- Every entry has: id, name, types (1–2), abilities (1–3), stats (all 6), evolution_chain (at least 1 entry), moves (at least 1).
- No null or empty names.
- Print a summary: total Pokémon, total unique moves, total evolution chains, file size.

---

## 4. Build Stage 2: Seed Phrase System

### 4.1 Word List

Create `src/wordlist.js` containing exactly 2048 common, easy-to-spell English words. Use a curated list of single-syllable or common two-syllable words (nouns, adjectives, verbs). No offensive words. No Pokémon names. Examples: `drift, ember, claw, frost, bloom, ridge, spark, shade, coral, flint, ...`

Export as a simple array: `export const WORDLIST = ["abandon", "ability", ...]`

Use BIP39 English wordlist as a starting point (it's 2048 words, well-curated, MIT licensed). Available at: `https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt`

### 4.2 Seed Phrase Generation

```javascript
function generatePhrase() {
  const words = [];
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * WORDLIST.length);
    words.push(WORDLIST[index]);
  }
  return words.join(" ");
}
```

This gives 2048³ = ~8.6 billion unique combinations — more than enough.

### 4.3 Deterministic Shuffle (Seeded PRNG)

Convert the 3-word phrase into a numeric seed, then use a seeded PRNG to shuffle.

**Hash function** (simple string → 32-bit integer):
```javascript
function hashSeed(phrase) {
  let hash = 0;
  for (let i = 0; i < phrase.length; i++) {
    const char = phrase.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

**Seeded PRNG** (mulberry32):
```javascript
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

**Shuffle** (Fisher-Yates with seeded random):
```javascript
function seededShuffle(array, phrase) {
  const rng = mulberry32(hashSeed(phrase));
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**Usage**: `const quizOrder = seededShuffle([1,2,3,...,1025], "drift ember claw").slice(0, count);`

**CRITICAL**: Both Challenger and Validator modes must call `seededShuffle` with the same phrase and same initial array `[1..1025]` to produce the same order.

---

## 5. Build Stage 3: App UI (React SPA)

### 5.1 Tech Stack

- **React 18** with hooks (functional components only)
- **Vite** for dev/build tooling
- **No external UI libraries** — all custom CSS
- **Google Font**: `Press Start 2P` for headers, `Outfit` for body text
- **No localStorage** — all state is in-memory React state

### 5.2 Screen Architecture

```
App
├── HomeScreen
│   ├── StartQuizFlow  →  generates phrase  →  ChallengerScreen
│   └── EnterCodeFlow  →  validates phrase  →  ValidatorScreen
├── ChallengerScreen
│   └── PokemonImageCard (image only, no details)
└── ValidatorScreen
    ├── PokemonImageCard (image)
    ├── PokemonDetailCard (name, types, abilities, stats, evo chain, moves)
    └── ScoreTracker
```

### 5.3 HomeScreen

Two main buttons centered on screen:

1. **"START QUIZ"** — opens a count selector (5 / 10 / 20 / 50 as tappable buttons). On selection:
   - Generate 3-word phrase.
   - Display it prominently with a "Copy" button.
   - Show instruction: "Share this code with your friend, then tap BEGIN".
   - "BEGIN" button → navigates to ChallengerScreen.

2. **"ENTER CODE"** — shows 3 text inputs (one per word) with autocomplete against the wordlist. On valid entry:
   - Navigates to ValidatorScreen.

### 5.4 ChallengerScreen

- **Header**: Seed phrase displayed (small, top-left), progress counter "3 / 10" (top-right).
- **Main area**: Large Pokémon image centered. The image is loaded from:
  `{image_base_url}{pokemon_id}.png`
- **Controls**: Single "NEXT →" button at the bottom. On the last Pokémon, button says "FINISH".
- **End state**: Shows "Quiz Complete! Ask your friend for your score."
- The Challenger sees NO details — just the image.

### 5.5 ValidatorScreen

- **Header**: Seed phrase (small), progress "3 / 10", running score "Score: 7 / 10" (top-right).
- **Main area split into two sections**:
  - **Left/Top (on mobile)**: Pokémon image (same as Challenger sees).
  - **Right/Bottom (on mobile)**: Detail card with:
    - **Name** in large text.
    - **Types** as colored badges (use standard Pokémon type colors).
    - **Abilities** as a comma-separated list, hidden ability marked with "(Hidden)".
    - **Base Stats** as horizontal bars with numeric values. Color each bar by stat value (green = high, red = low). Max stat reference = 255.
    - **Evolution Chain** shown as a horizontal flow: `Bulbasaur → [Lv.16] → Ivysaur → [Lv.32] → Venusaur`. Use small circular images (40px) for each stage loaded from the same image CDN.
    - **Moves** as a scrollable list showing level and move name, e.g. "Lv. 1 — Tackle".
- **Controls**: Two buttons side by side:
  - "✓ CORRECT" (green) — increments score, advances.
  - "✗ WRONG" (red) — does not increment score, advances.
- **End screen**: Final score "8 / 10", percentage, and a summary grid showing each Pokémon's image + name + whether they got it right (✓ or ✗). "PLAY AGAIN" button returns to HomeScreen.

### 5.6 Visual Design — Pokédex Retro Theme

**Color palette**:
```css
--pokedex-red: #CC0000;
--pokedex-dark-red: #8B0000;
--screen-bg: #1a1a2e;
--screen-border: #16213e;
--text-primary: #e0e0e0;
--text-accent: #FFD700;
--correct-green: #22c55e;
--wrong-red: #ef4444;
--card-bg: #0f3460;
```

**Pokémon type colors** (for type badges):
```javascript
const TYPE_COLORS = {
  Normal: "#A8A77A", Fire: "#EE8130", Water: "#6390F0",
  Electric: "#F7D02C", Grass: "#7AC74C", Ice: "#96D9D6",
  Fighting: "#C22E28", Poison: "#A33EA1", Ground: "#E2BF65",
  Flying: "#A98FF3", Psychic: "#F95587", Bug: "#A6B91A",
  Rock: "#B6A136", Ghost: "#735797", Dragon: "#6F35FC",
  Dark: "#705746", Steel: "#B7B7CE", Fairy: "#D685AD"
};
```

**Design details**:
- App container has a rounded red border (like a Pokédex device shell).
- The "screen" area has a subtle scanline overlay (CSS repeating-linear-gradient, semi-transparent).
- Buttons look like physical device buttons (rounded, slight 3D shadow, press-down animation on click).
- Page transitions: slide-in from right.
- Image load: fade-in with a brief Pokéball loading spinner placeholder.
- Stat bars animate on reveal (CSS transition, width from 0 to target).
- Responsive: single-column stack on mobile (<768px), side-by-side on desktop.
- Font loading: `<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">`

---

## 6. Build Stage 4: PWA & Offline

### 6.1 manifest.json

```json
{
  "name": "PokéDex Quiz",
  "short_name": "PokéQuiz",
  "description": "Quiz your friends on Pokémon knowledge",
  "start_url": "/pokedex-quiz/",
  "scope": "/pokedex-quiz/",
  "display": "standalone",
  "background_color": "#CC0000",
  "theme_color": "#CC0000",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Generate the PWA icons programmatically: a simple Pokéball-style circle (red top half, white bottom half, dark center circle) using canvas or SVG at 192px and 512px.

### 6.2 Service Worker (`sw.js`)

Cache strategy:
- **App shell** (HTML, CSS, JS, pokemon-data.json): Cache on install, serve cache-first.
- **Pokémon images**: Cache on first fetch (network-first, fallback to cache). This means images are available offline after being viewed once.
- **Cache name versioning**: Include a version string so updates bust the cache.

```javascript
const CACHE_NAME = 'pokedex-quiz-v1';
const APP_SHELL = [
  '/pokedex-quiz/',
  '/pokedex-quiz/index.html',
  '/pokedex-quiz/assets/index.js',
  '/pokedex-quiz/assets/index.css',
  '/pokedex-quiz/pokemon-data.json',
  '/pokedex-quiz/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Pokémon images: cache-first (once downloaded, always available offline)
  if (url.hostname === 'raw.githubusercontent.com') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
```

### 6.3 Service Worker Registration

In `index.html` or `main.jsx`:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/pokedex-quiz/sw.js');
}
```

---

## 7. Build Stage 5: GitHub Pages Deployment

### 7.1 Vite Config

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/pokedex-quiz/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

### 7.2 Deployment Setup

The built output goes to the `dist/` folder. For GitHub Pages deployment:

1. The repo is `cvanesh/pokedex-quiz`.
2. Use a GitHub Actions workflow (`.github/workflows/deploy.yml`) to build and deploy:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build data
        run: node scripts/build-data.js

      - name: Build app
        run: npm run build

      - name: Copy static assets
        run: |
          cp public/sw.js dist/
          cp public/manifest.json dist/
          cp -r public/icons dist/

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

3. In the GitHub repo settings, enable Pages with "GitHub Actions" as the source.

### 7.3 Project File Structure

```
pokedex-quiz/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── data/                          # Cloned PokeAPI CSV files (gitignored)
│   └── v2/csv/
│       ├── pokemon.csv
│       ├── pokemon_species.csv
│       └── ... (all CSV files listed in §2.1)
├── scripts/
│   └── build-data.js              # Data pipeline script
├── public/
│   ├── sw.js                      # Service worker
│   ├── manifest.json              # PWA manifest
│   ├── pokemon-data.json          # Generated by build-data.js
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── main.jsx                   # Entry point
│   ├── App.jsx                    # Root component + routing
│   ├── components/
│   │   ├── HomeScreen.jsx
│   │   ├── ChallengerScreen.jsx
│   │   ├── ValidatorScreen.jsx
│   │   ├── PokemonImage.jsx       # Image loader with Pokéball spinner
│   │   ├── PokemonDetail.jsx      # Full detail card
│   │   ├── StatBars.jsx           # Animated stat bar chart
│   │   ├── EvolutionChain.jsx     # Evolution flow display
│   │   ├── TypeBadge.jsx          # Colored type badge
│   │   └── ScoreSummary.jsx       # End-of-quiz results
│   ├── utils/
│   │   ├── wordlist.js            # 2048-word array
│   │   ├── seed.js                # hashSeed, mulberry32, seededShuffle
│   │   └── constants.js           # TYPE_COLORS, stat labels, etc.
│   └── styles/
│       └── index.css              # All styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### 7.4 package.json

```json
{
  "name": "pokedex-quiz",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:data": "node scripts/build-data.js"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0"
  }
}
```

---

## 8. Build Order & Validation Checklist

Execute these stages in order. Validate each before proceeding.

### Stage 1: Project Setup
- [ ] Initialize project with `npm create vite@latest pokedex-quiz -- --template react`.
- [ ] Install dependencies.
- [ ] Download PokeAPI CSV data: clone `https://github.com/PokeAPI/pokeapi.git` and copy `data/v2/csv/` into project `data/v2/csv/`.
- [ ] Verify: `ls data/v2/csv/pokemon_species.csv` exists.

### Stage 2: Data Pipeline
- [ ] Create `scripts/build-data.js` per §3.
- [ ] Run `node scripts/build-data.js`.
- [ ] Validate output:
  - `public/pokemon-data.json` exists.
  - Contains exactly 1025 Pokémon entries.
  - Spot-check: entry "1" has name "Bulbasaur", types ["Grass","Poison"], stats.hp=45.
  - Spot-check: entry "25" has name "Pikachu", types ["Electric"].
  - Spot-check: entry "133" (Eevee) has evolution_chain with 9 entries (Eevee + 8 eeveelutions).
  - All entries have non-empty moves array.
  - Print file size (should be 1–3 MB).

### Stage 3: Seed System
- [ ] Create `src/utils/wordlist.js` with 2048 words.
- [ ] Create `src/utils/seed.js` with hashSeed, mulberry32, seededShuffle.
- [ ] Validate: `seededShuffle([1..1025], "drift ember claw")` returns the same result every call.
- [ ] Validate: different phrases produce different orderings.

### Stage 4: UI Components
- [ ] Create all components per §5.
- [ ] Verify HomeScreen renders with both buttons.
- [ ] Verify ChallengerScreen shows images only (no Pokémon names/details visible).
- [ ] Verify ValidatorScreen shows full details + correct/incorrect buttons.
- [ ] Verify score tracking works correctly.
- [ ] Verify end screen shows final score and summary grid.
- [ ] Verify responsive layout (mobile and desktop).
- [ ] Run `npm run dev` and manually test full flow.

### Stage 5: PWA
- [ ] Create `public/sw.js`, `public/manifest.json`, and PWA icons.
- [ ] Register service worker in app.
- [ ] Build: `npm run build`.
- [ ] Verify `dist/` contains: index.html, assets/, sw.js, manifest.json, icons/, pokemon-data.json.
- [ ] Run `npx serve dist` and verify app works.

### Stage 6: Deployment Config
- [ ] Create `.github/workflows/deploy.yml` per §7.2.
- [ ] Verify `vite.config.js` has `base: '/pokedex-quiz/'`.
- [ ] Verify all internal links/routes use the `/pokedex-quiz/` base path.
- [ ] Create README.md with project description and setup instructions.

---

## 9. Important Edge Cases

1. **Images that fail to load**: Show a silhouette placeholder (dark shape on the screen background) with a "?" — don't break the quiz flow.
2. **Pokémon with no evolution**: `evolution_chain` will have just 1 entry (itself). Display "Does not evolve." in the evo section.
3. **Seed phrase validation**: When entering a code, validate each word exists in the wordlist. Show inline validation (green check / red x per word).
4. **Browser back button**: Don't break the quiz flow. Optionally, show a "Leave quiz?" confirmation.
5. **Count must match**: Both players must independently select the same count. Consider displaying the count alongside the seed phrase, e.g. "drift ember claw (10)". Encode the count into the phrase display so the Validator knows.
6. **Legendary/Mythical badge**: Optionally show a small star/badge on legendary or mythical Pokémon in the detail view.

---

## 10. Quick Reference: Key Numbers

| Metric | Value |
|--------|-------|
| Total Pokémon | 1,025 |
| Generations covered | 1–9 |
| Unique types | 18 |
| Unique abilities | 367 |
| Unique moves | 937 |
| Evolution chains | 541 |
| Seed phrase combinations | ~8.6 billion |
| Image source | PokeAPI/sprites official-artwork (PNG, ~100–200KB each) |
| Estimated JSON data size | 1–3 MB |
