import { useState, useMemo, useRef } from 'react';
import { getQuizPokemon } from '../utils/seed.js';
import PokemonImage from './PokemonImage.jsx';
import PokemonDetail from './PokemonDetail.jsx';
import ScoreSummary from './ScoreSummary.jsx';

export default function ValidatorScreen({ phrase, count, pokemonData, onNavigate }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);
  const topRef = useRef(null);

  const quizIds = useMemo(() => getQuizPokemon(phrase, count), [phrase, count]);

  const handleAnswer = (correct) => {
    const pokemonId = quizIds[current];
    const newResults = [...results, { id: pokemonId, correct }];
    setResults(newResults);

    if (correct) setScore(s => s + 1);

    if (current >= count - 1) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="validator-screen" ref={topRef}>
      <div className="game-header">
        <span className="header-phrase">{phrase}</span>
        <span className="header-progress">{current + 1} / {count}</span>
        <span className="header-score">Score: {score} / {current}</span>
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
