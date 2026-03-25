import { useState, useMemo, useEffect } from 'react';
import { getQuizPokemon } from '../utils/seed.js';
import PokemonImage from './PokemonImage.jsx';
import PokemonDetail from './PokemonDetail.jsx';
import ScoreSummary from './ScoreSummary.jsx';

export default function ValidatorScreen({ phrase, count, pokemonData, onNavigate, showConfirm }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);

  const quizIds = useMemo(() => getQuizPokemon(phrase, count), [phrase, count]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current]);

  const handleAnswer = (correct) => {
    const pokemonId = quizIds[current];
    const newResults = [...results, { id: pokemonId, correct }];
    setResults(newResults);

    if (correct) setScore(s => s + 1);

    if (current >= count - 1) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  if (finished) {
    return (
      <div className="validator-screen">
        <ScoreSummary
          results={results}
          pokemonData={pokemonData}
          onPlayAgain={() => onNavigate('home')}
        />
      </div>
    );
  }

  const pokemonId = quizIds[current];
  const pokemon = pokemonData.pokemon[pokemonId];

  return (
    <div className="validator-screen">
      <div className="game-header">
        <span className="header-phrase">{phrase}</span>
        <span className="header-progress">{current + 1} / {count}</span>
        <span className="header-score">Score: {score} / {current}</span>
        <button className="btn-home" onClick={async () => { if (await showConfirm('Leave the quiz?')) onNavigate('home'); }} title="Home">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L2 9h3v8h4v-5h2v5h4V9h3L10 2z"/></svg>
        </button>
      </div>
      <div className="validator-image">
        <PokemonImage id={pokemonId} size="large" alt={pokemon?.name || 'Pokémon'} />
      </div>
      <div className="game-controls validator-controls">
        <button className="btn btn-correct" onClick={() => handleAnswer(true)}>
          ✓ CORRECT
        </button>
        <button className="btn btn-wrong" onClick={() => handleAnswer(false)}>
          ✗ WRONG
        </button>
      </div>
      <div className="validator-details">
        <PokemonDetail pokemon={pokemon} />
      </div>
    </div>
  );
}
