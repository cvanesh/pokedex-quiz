import { useState, useMemo, useEffect } from 'react';
import { getQuizPokemon } from '../utils/seed.js';
import PokemonImage from './PokemonImage.jsx';
import ScoreSummary from './ScoreSummary.jsx';

export default function ChallengerScreen({ phrase, count, pokemonData, onNavigate }) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('quiz'); // 'quiz' | 'review' | 'results'
  const [reviewIndex, setReviewIndex] = useState(0);
  const [results, setResults] = useState([]);

  const quizIds = useMemo(() => getQuizPokemon(phrase, count), [phrase, count]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current, reviewIndex, phase]);

  const handleNext = () => {
    if (current >= count - 1) {
      setPhase('review');
    } else {
      setCurrent(c => c + 1);
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleReviewAnswer = (correct) => {
    const pokemonId = quizIds[reviewIndex];
    setResults(prev => [...prev, { id: pokemonId, correct }]);

    if (reviewIndex >= count - 1) {
      setPhase('results');
    } else {
      setReviewIndex(i => i + 1);
    }
  };

  if (phase === 'results') {
    return (
      <div className="challenger-screen">
        <ScoreSummary
          results={results}
          pokemonData={pokemonData}
          onPlayAgain={() => onNavigate('home')}
        />
      </div>
    );
  }

  if (phase === 'review') {
    const pokemonId = quizIds[reviewIndex];
    const pokemon = pokemonData.pokemon[pokemonId];

    return (
      <div className="challenger-screen">
        <div className="game-header">
          <span className="header-phrase">Did you get it right?</span>
          <span className="header-progress">{reviewIndex + 1} / {count}</span>
        </div>
        <div className="game-main">
          <PokemonImage id={pokemonId} size="large" alt={pokemon?.name || 'Pokémon'} />
        </div>
        <h2 className="review-pokemon-name">{pokemon?.name}</h2>
        <div className="game-controls validator-controls">
          <button className="btn btn-correct" onClick={() => handleReviewAnswer(true)}>
            ✓ KNEW IT
          </button>
          <button className="btn btn-wrong" onClick={() => handleReviewAnswer(false)}>
            ✗ NOPE
          </button>
        </div>
      </div>
    );
  }

  const pokemonId = quizIds[current];

  return (
    <div className="challenger-screen">
      <div className="game-header">
        <span className="header-phrase">{phrase}</span>
        <span className="header-progress">{current + 1} / {count}</span>
      </div>
      <div className="game-main">
        <PokemonImage id={pokemonId} size="large" alt="Who's that Pokémon?" />
      </div>
      <div className="game-controls challenger-controls">
        <button className="btn btn-secondary" onClick={handlePrev} disabled={current === 0}>
          ← PREV
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          {current >= count - 1 ? 'FINISH' : 'NEXT →'}
        </button>
      </div>
    </div>
  );
}
