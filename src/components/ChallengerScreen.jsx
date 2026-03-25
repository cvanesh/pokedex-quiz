import { useState, useMemo, useEffect } from 'react';
import { getQuizPokemon } from '../utils/seed.js';
import PokemonImage from './PokemonImage.jsx';

export default function ChallengerScreen({ phrase, count, pokemonData, onNavigate, showConfirm }) {
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizIds = useMemo(() => getQuizPokemon(phrase, count), [phrase, count]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current, finished]);

  const handleNext = () => {
    if (current >= count - 1) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  if (finished) {
    return (
      <div className="challenger-screen">
        <div className="finish-screen">
          <h2>Quiz Complete!</h2>
          <p>Ask your friend for your score.</p>
          <button className="btn btn-primary btn-large" onClick={() => onNavigate('home')}>
            HOME
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
        <button className="btn-home" onClick={async () => { if (await showConfirm('Leave the quiz?')) onNavigate('home'); }} title="Home">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L2 9h3v8h4v-5h2v5h4V9h3L10 2z"/></svg>
        </button>
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
