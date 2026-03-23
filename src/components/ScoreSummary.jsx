import PokemonImage from './PokemonImage.jsx';

export default function ScoreSummary({ results, pokemonData, onPlayAgain }) {
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const pct = Math.round((correct / total) * 100);

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
            <div key={r.id} className={`result-card ${r.correct ? 'correct' : 'wrong'}`}>
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
