import { useState, useCallback, useEffect, useRef } from 'react';
import HomeScreen from './components/HomeScreen.jsx';
import ChallengerScreen from './components/ChallengerScreen.jsx';
import ValidatorScreen from './components/ValidatorScreen.jsx';
import BrowseScreen from './components/BrowseScreen.jsx';
import ManualScreen from './components/ManualScreen.jsx';
import SoloScreen from './components/SoloScreen.jsx';
import PokeDialog from './components/PokeDialog.jsx';
import DebugLog from './components/DebugLog.jsx';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [phrase, setPhrase] = useState('');
  const [count, setCount] = useState(10);
  const [pokemonData, setPokemonData] = useState(null);
  const [dataError, setDataError] = useState(false);
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

  const loadPokemonData = useCallback(() => {
    setDataError(false);
    fetch(import.meta.env.BASE_URL + 'pokemon-data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setPokemonData(data))
      .catch(() => setDataError(true));
  }, []);

  useEffect(() => {
    loadPokemonData();
  }, [loadPokemonData]);

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
    const quizScreens = ['challenger', 'validator', 'solo'];
    const handlePopState = async () => {
      if (screenRef.current !== 'home') {
        window.history.pushState(null, '', '');
        // Only ask for confirmation on quiz screens where progress would be lost
        if (quizScreens.includes(screenRef.current)) {
          const confirmed = await showConfirm('Leave the quiz?');
          if (confirmed) setScreen('home');
        } else {
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
          {dataError ? (
            <>
              <p>Failed to load data.</p>
              <button className="btn btn-primary" onClick={loadPokemonData}>
                Retry
              </button>
            </>
          ) : (
            <>
              <div className="pokeball-spinner" />
              <p>Loading PokéDex data...</p>
            </>
          )}
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
          {screen === 'solo' && (
            <SoloScreen
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
          {screen === 'manual' && (
            <ManualScreen onNavigate={navigate} />
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
      <DebugLog />
    </div>
  );
}
