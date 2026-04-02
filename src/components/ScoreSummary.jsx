import { useState } from 'react';
import PokemonImage from './PokemonImage.jsx';
import PokemonDetail from './PokemonDetail.jsx';

export default function ScoreSummary({ results, pokemonData, onPlayAgain }) {
  const [selectedId, setSelectedId] = useState(null);
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const pct = Math.round((correct / total) * 100);

  const selectedPokemon = selectedId ? pokemonData.pokemon[selectedId] : null;

  if (selectedPokemon) {
    return (
      <div className="score-summary">
        <button className="btn btn-back" onClick={() => setSelectedId(null)}>
          ← Back to results
        </button>
        <div className="browse-detail-view">
          <div className="browse-detail-image">
            <PokemonImage key={selectedPokemon.id} id={selectedPokemon.id} size="large" alt={selectedPokemon.name} />
          </div>
          <PokemonDetail pokemon={selectedPokemon} />
        </div>
      </div>
    );
  }

  return (
    <div className="score-summary">
      <h2>Quiz Complete!</h2>
      <div className="final-score">
        <span className="score-number">{correct} / {total}</span>
        <span className="score-pct">{pct}%</span>
      </div>
      <div className="results-grid">
        {results.map(r => {
          const p = pokemonData.pokemon[r.id];
          return (
            <div
              key={r.id}
              className={`result-card ${r.correct ? 'correct' : 'wrong'}`}
              onClick={() => setSelectedId(r.id)}
            >
              <PokemonImage id={r.id} size="small" alt={p?.name || '?'} />
              <span className="result-name">{p?.name || '?'}</span>
              <span className="result-mark">{r.correct ? '✓' : '✗'}</span>
            </div>
          );
        })}
      </div>
      <button className="btn btn-primary btn-large" onClick={onPlayAgain}>
        PLAY AGAIN
      </button>
    </div>
  );
}
