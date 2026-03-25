import { useState, useCallback, useEffect, useRef } from 'react';
import HomeScreen from './components/HomeScreen.jsx';
import ChallengerScreen from './components/ChallengerScreen.jsx';
import ValidatorScreen from './components/ValidatorScreen.jsx';
import BrowseScreen from './components/BrowseScreen.jsx';
import PokeDialog from './components/PokeDialog.jsx';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [phrase, setPhrase] = useState('');
  const [count, setCount] = useState(10);
  const [pokemonData, setPokemonData] = useState(null);
  const [slideDir, setSlideDir] = useState('right');
  const prevScreen = useRef('home');

  // Dialog state
  const [dialog, setDialog] = useState(null);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setDialog({
        message,
        onConfirm: () => { setDialog(null); resolve(true); },
        onCancel: () => { setDialog(null); resolve(false); },
      });
    });
  }, []);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'pokemon-data.json')
      .then(r => r.json())
      .then(data => setPokemonData(data))
      .catch(err => console.error('Failed to load pokemon data:', err));
  }, []);

  const navigate = useCallback((newScreen, options = {}) => {
    if (options.phrase) setPhrase(options.phrase);
    if (options.count) setCount(options.count);
    setSlideDir(newScreen === 'home' ? 'left' : 'right');
    prevScreen.current = screen;
    setScreen(newScreen);
  }, [screen]);

  // Use a ref so the popstate handler always sees the latest showConfirm & screen
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    const handlePopState = async () => {
      if (screenRef.current !== 'home') {
        // Push state immediately to prevent actual navigation
        window.history.pushState(null, '', '');
        const confirmed = await showConfirm('Leave the quiz?');
        if (confirmed) {
          setScreen('home');
        }
      }
    };

    if (screen !== 'home') {
      window.history.pushState(null, '', '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [screen, showConfirm]);

  if (!pokemonData) {
    return (
      <div className="pokedex-shell">
        <div className="pokedex-screen loading-screen">
          <div className="pokeball-spinner" />
          <p>Loading PokéDex data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pokedex-shell">
      <div className="pokedex-screen">
        <div className="scanline-overlay" />
        <div className={`screen-content slide-${slideDir}`} key={screen + phrase}>
          {screen === 'home' && (
            <HomeScreen onNavigate={navigate} />
          )}
          {screen === 'challenger' && (
            <ChallengerScreen
              phrase={phrase}
              count={count}
              pokemonData={pokemonData}
              onNavigate={navigate}
              showConfirm={showConfirm}
            />
          )}
          {screen === 'validator' && (
            <ValidatorScreen
              phrase={phrase}
              count={count}
              pokemonData={pokemonData}
              onNavigate={navigate}
              showConfirm={showConfirm}
            />
          )}
          {screen === 'browse' && (
            <BrowseScreen
              pokemonData={pokemonData}
              onNavigate={navigate}
            />
          )}
        </div>
      </div>
      {dialog && (
        <PokeDialog
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      )}
    </div>
  );
}
