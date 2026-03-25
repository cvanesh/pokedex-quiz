import { useState, useRef } from 'react';
import { generatePhrase, validateWord } from '../utils/seed.js';
import { WORDLIST } from '../utils/wordlist.js';
import { QUIZ_COUNTS } from '../utils/constants.js';

export default function HomeScreen({ onNavigate }) {
  const [mode, setMode] = useState(null); // null | 'start' | 'enter'
  const [selectedCount, setSelectedCount] = useState(null);
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [copied, setCopied] = useState(false);
  const [codeWords, setCodeWords] = useState(['', '', '']);
  const [codeValid, setCodeValid] = useState([null, null, null]);
  const [enterCount, setEnterCount] = useState(null);
  const wordInputRefs = [useRef(null), useRef(null), useRef(null)];

  const handleStartQuiz = () => setMode('start');
  const handleEnterCode = () => setMode('enter');
  const handleBack = () => {
    setMode(null);
    setSelectedCount(null);
    setGeneratedPhrase('');
    setCopied(false);
    setCodeWords(['', '', '']);
    setCodeValid([null, null, null]);
    setEnterCount(null);
  };

  const handleSelectCount = (count) => {
    setSelectedCount(count);
    const phrase = generatePhrase();
    setGeneratedPhrase(phrase);
  };

  const handleCopy = () => {
    const text = `${generatedPhrase} (${selectedCount})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleBegin = () => {
    onNavigate('challenger', { phrase: generatedPhrase, count: selectedCount });
  };

  const prevWordLengths = useRef([0, 0, 0]);

  const handleWordChange = (index, e) => {
    const value = e.target.value;
    const lower = value.toLowerCase().trim();
    const prevLen = prevWordLengths.current[index];
    const newWords = [...codeWords];
    newWords[index] = lower;
    setCodeWords(newWords);

    const newValid = [...codeValid];
    if (lower === '') {
      newValid[index] = null;
    } else {
      newValid[index] = validateWord(lower);
    }
    setCodeValid(newValid);

    prevWordLengths.current[index] = lower.length;

    // Auto-advance when user selects from dropdown or autocomplete
    // Detect: inputType is insertReplacementText (Chrome), OR value jumped 2+ chars and is now valid (iOS/Safari)
    const inputType = e.nativeEvent?.inputType;
    const wasDropdownSelect = inputType === 'insertReplacementText';
    const wasAutocomplete = newValid[index] && (lower.length - prevLen) >= 2;

    if ((wasDropdownSelect || wasAutocomplete) && newValid[index]) {
      if (index < 2) {
        setTimeout(() => wordInputRefs[index + 1].current?.focus(), 50);
      } else {
        setTimeout(() => {
          wordInputRefs[index].current?.blur();
          // Focus the JOIN QUIZ button
          document.querySelector('.code-entry .btn-primary')?.focus();
        }, 50);
      }
    }
  };

  const handleWordKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (codeValid[index] && index < 2) {
        wordInputRefs[index + 1].current?.focus();
      } else if (codeValid[index] && index === 2) {
        wordInputRefs[index].current?.blur();
      }
    }
  };

  const getSuggestions = (value, isValid) => {
    if (!value || value.length < 2 || isValid) return [];
    const lower = value.toLowerCase();
    return WORDLIST.filter(w => w.startsWith(lower) && w !== lower).slice(0, 5);
  };

  const allWordsValid = codeValid.every(v => v === true) && enterCount !== null;
  const enteredPhrase = codeWords.join(' ');

  const handleJoin = () => {
    onNavigate('validator', { phrase: enteredPhrase, count: enterCount });
  };

  return (
    <div className="home-screen">
      <div className="home-header">
        <h1 className="app-title">PokéDex Quiz</h1>
        <p className="app-subtitle">Test your Pokémon knowledge!</p>
      </div>

      {mode === null && (
        <div className="home-buttons">
          <button className="btn btn-primary btn-large" onClick={handleStartQuiz}>
            START QUIZ
          </button>
          <button className="btn btn-secondary btn-large" onClick={handleEnterCode}>
            ENTER CODE
          </button>
          <button className="btn btn-secondary btn-large" onClick={() => onNavigate('browse')}>
            BROWSE POKéMON
          </button>
        </div>
      )}

      {mode === 'start' && !selectedCount && (
        <div className="count-selector">
          <h2>How many Pokémon?</h2>
          <div className="count-buttons">
            {QUIZ_COUNTS.map(c => (
              <button key={c} className="btn btn-count" onClick={() => handleSelectCount(c)}>
                {c}
              </button>
            ))}
          </div>
          <button className="btn btn-back" onClick={handleBack}>← Back</button>
        </div>
      )}

      {mode === 'start' && selectedCount && (
        <div className="phrase-display">
          <h2>Your Quiz Code</h2>
          <div className="phrase-box">
            <span className="phrase-text">{generatedPhrase}</span>
            <span className="phrase-count">({selectedCount})</span>
          </div>
          <button className="btn btn-copy" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
          <p className="phrase-instruction">
            Share this code with your friend, then tap BEGIN
          </p>
          <button className="btn btn-primary btn-large" onClick={handleBegin}>
            BEGIN
          </button>
          <button className="btn btn-back" onClick={handleBack}>← Back</button>
        </div>
      )}

      {mode === 'enter' && (
        <div className="code-entry">
          <h2>Enter Quiz Code</h2>
          <div className="count-selector-inline">
            <p>Number of Pokémon:</p>
            <div className="count-buttons">
              {QUIZ_COUNTS.map(c => (
                <button
                  key={c}
                  className={`btn btn-count ${enterCount === c ? 'active' : ''}`}
                  onClick={() => setEnterCount(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="word-inputs">
            {[0, 1, 2].map(i => (
              <div key={i} className="word-input-group">
                <input
                  ref={wordInputRefs[i]}
                  type="text"
                  className={`word-input ${codeValid[i] === true ? 'valid' : codeValid[i] === false ? 'invalid' : ''}`}
                  placeholder={`Word ${i + 1}`}
                  value={codeWords[i]}
                  onChange={e => handleWordChange(i, e)}
                  onKeyDown={e => handleWordKeyDown(i, e)}
                  autoComplete="off"
                  list={`suggestions-${i}`}
                />
                <datalist id={`suggestions-${i}`}>
                  {getSuggestions(codeWords[i], codeValid[i]).map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <span className="word-status">
                  {codeValid[i] === true ? '✓' : codeValid[i] === false ? '✗' : ''}
                </span>
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary btn-large"
            disabled={!allWordsValid}
            onClick={handleJoin}
          >
            JOIN QUIZ
          </button>
          <button className="btn btn-back" onClick={handleBack}>← Back</button>
        </div>
      )}
    </div>
  );
}
