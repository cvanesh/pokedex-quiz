import { useState, useMemo, useEffect, useRef } from 'react';
import { TYPE_COLORS } from '../utils/constants.js';
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

const ALL_TYPES = Object.keys(TYPE_COLORS);

export default function BrowseScreen({ pokemonData, onNavigate }) {
  const [search, setSearch] = useState('');
  const [expandedGen, setExpandedGen] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [browseMode, setBrowseMode] = useState('generation'); // 'generation' | 'type'
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [typeSearch, setTypeSearch] = useState('');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeInputRef = useRef(null);
  const typeContainerRef = useRef(null);

  const allPokemon = useMemo(() => {
    return Object.values(pokemonData.pokemon).sort((a, b) => a.id - b.id);
  }, [pokemonData]);

  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const lower = search.toLowerCase();
    return allPokemon.filter(p => p.name.toLowerCase().includes(lower)).slice(0, 20);
  }, [search, allPokemon]);

  const typeFilterResults = useMemo(() => {
    if (selectedTypes.length === 0) return [];
    return allPokemon.filter(p =>
      selectedTypes.every(t => p.types.includes(t))
    );
  }, [selectedTypes, allPokemon]);

  const filteredTypeOptions = useMemo(() => {
    return ALL_TYPES.filter(t =>
      !selectedTypes.includes(t) &&
      t.toLowerCase().startsWith(typeSearch.toLowerCase())
    );
  }, [typeSearch, selectedTypes]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeContainerRef.current && !typeContainerRef.current.contains(e.target)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addType = (type) => {
    if (selectedTypes.length >= 2) return;
    setSelectedTypes(prev => [...prev, type]);
    setTypeSearch('');
    if (selectedTypes.length >= 1) {
      // Already at max after adding, close dropdown
      setTypeDropdownOpen(false);
    } else {
      setTypeDropdownOpen(true);
      setTimeout(() => typeInputRef.current?.focus(), 0);
    }
  };

  const removeType = (type) => {
    setSelectedTypes(prev => prev.filter(t => t !== type));
  };

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
        <>
          <div className="browse-mode-tabs">
            <button
              className={`browse-tab ${browseMode === 'generation' ? 'active' : ''}`}
              onClick={() => setBrowseMode('generation')}
            >
              By Generation
            </button>
            <button
              className={`browse-tab ${browseMode === 'type' ? 'active' : ''}`}
              onClick={() => setBrowseMode('type')}
            >
              By Type
            </button>
          </div>

          {browseMode === 'generation' && (
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

          {browseMode === 'type' && (
            <div className="type-filter-section">
              <div className="type-tags-input" ref={typeContainerRef} onClick={() => {
                typeInputRef.current?.focus();
                setTypeDropdownOpen(true);
              }}>
                {selectedTypes.map(type => (
                  <span
                    key={type}
                    className="type-tag"
                    style={{ backgroundColor: TYPE_COLORS[type] }}
                  >
                    {type}
                    <button
                      className="type-tag-remove"
                      onClick={() => removeType(type)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {selectedTypes.length < 2 && <input
                  ref={typeInputRef}
                  type="text"
                  className="type-tag-input"
                  placeholder={selectedTypes.length === 0 ? 'Add types to filter...' : 'Add 2nd type...'}
                  value={typeSearch}
                  onChange={e => {
                    setTypeSearch(e.target.value);
                    setTypeDropdownOpen(true);
                  }}
                  onFocus={() => setTypeDropdownOpen(true)}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && typeSearch === '' && selectedTypes.length > 0) {
                      removeType(selectedTypes[selectedTypes.length - 1]);
                    }
                  }}
                />}
                {typeDropdownOpen && selectedTypes.length < 2 && filteredTypeOptions.length > 0 && (
                  <div className="type-dropdown">
                    {filteredTypeOptions.map(type => (
                      <button
                        key={type}
                        className="type-dropdown-item"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => addType(type)}
                      >
                        <span
                          className="type-dropdown-color"
                          style={{ backgroundColor: TYPE_COLORS[type] }}
                        />
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTypes.length > 0 && (
                <>
                  <p className="type-filter-count">
                    {typeFilterResults.length} Pokémon found
                  </p>
                  <div className="gen-pokemon-grid">
                    {typeFilterResults.map(p => (
                      <div key={p.id} className="browse-card" onClick={() => setSelectedId(p.id)}>
                        <PokemonImage id={p.id} size="small" alt={p.name} />
                        <span className="browse-card-name">{p.name}</span>
                        <span className="browse-card-id">#{String(p.id).padStart(4, '0')}</span>
                      </div>
                    ))}
                  </div>
                  {typeFilterResults.length === 0 && (
                    <p className="no-results">No Pokémon match all selected types.</p>
                  )}
                </>
              )}

              {selectedTypes.length === 0 && (
                <p className="no-results">Select one or more types above to filter.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
