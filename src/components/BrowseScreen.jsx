import { useState, useMemo, useEffect } from 'react';
import PokemonImage from './PokemonImage.jsx';
import PokemonDetail from './PokemonDetail.jsx';

const GENERATIONS = [
  { id: 1, name: 'Gen I — Kanto', range: [1, 151] },
  { id: 2, name: 'Gen II — Johto', range: [152, 251] },
  { id: 3, name: 'Gen III — Hoenn', range: [252, 386] },
  { id: 4, name: 'Gen IV — Sinnoh', range: [387, 493] },
  { id: 5, name: 'Gen V — Unova', range: [494, 649] },
  { id: 6, name: 'Gen VI — Kalos', range: [650, 721] },
  { id: 7, name: 'Gen VII — Alola', range: [722, 809] },
  { id: 8, name: 'Gen VIII — Galar', range: [810, 905] },
  { id: 9, name: 'Gen IX — Paldea', range: [906, 1025] },
];

export default function BrowseScreen({ pokemonData, onNavigate }) {
  const [search, setSearch] = useState('');
  const [expandedGen, setExpandedGen] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const allPokemon = useMemo(() => {
    return Object.values(pokemonData.pokemon).sort((a, b) => a.id - b.id);
  }, [pokemonData]);

  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const lower = search.toLowerCase();
    return allPokemon.filter(p => p.name.toLowerCase().includes(lower)).slice(0, 20);
  }, [search, allPokemon]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedId]);

  const selectedPokemon = selectedId ? pokemonData.pokemon[selectedId] : null;

  if (selectedPokemon) {
    return (
      <div className="browse-screen">
        <button className="btn btn-back browse-back" onClick={() => setSelectedId(null)}>
          ← Back to list
        </button>
        <div className="browse-detail-view">
          <div className="browse-detail-image">
            <PokemonImage id={selectedPokemon.id} size="large" alt={selectedPokemon.name} />
          </div>
          <PokemonDetail pokemon={selectedPokemon} />
        </div>
      </div>
    );
  }

  return (
    <div className="browse-screen">
      <div className="browse-header">
        <h2>Browse Pokémon</h2>
        <button className="btn btn-back" onClick={() => onNavigate('home')}>
          ← Home
        </button>
      </div>

      <div className="browse-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {search.length >= 2 && (
        <div className="search-results">
          {searchResults.length === 0 && (
            <p className="no-results">No Pokémon found.</p>
          )}
          {searchResults.map(p => (
            <div key={p.id} className="browse-card" onClick={() => setSelectedId(p.id)}>
              <PokemonImage id={p.id} size="small" alt={p.name} />
              <span className="browse-card-name">{p.name}</span>
              <span className="browse-card-id">#{String(p.id).padStart(4, '0')}</span>
            </div>
          ))}
        </div>
      )}

      {search.length < 2 && (
        <div className="gen-list">
          {GENERATIONS.map(gen => (
            <div key={gen.id} className="gen-group">
              <button
                className={`gen-header ${expandedGen === gen.id ? 'expanded' : ''}`}
                onClick={() => setExpandedGen(expandedGen === gen.id ? null : gen.id)}
              >
                <span>{gen.name}</span>
                <span className="gen-count">{gen.range[1] - gen.range[0] + 1}</span>
                <span className="gen-arrow">{expandedGen === gen.id ? '▾' : '▸'}</span>
              </button>
              {expandedGen === gen.id && (
                <div className="gen-pokemon-grid">
                  {allPokemon
                    .filter(p => p.id >= gen.range[0] && p.id <= gen.range[1])
                    .map(p => (
                      <div key={p.id} className="browse-card" onClick={() => setSelectedId(p.id)}>
                        <PokemonImage id={p.id} size="small" alt={p.name} />
                        <span className="browse-card-name">{p.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
