import { useState, useEffect, useRef } from 'react';

const MAX_ENTRIES = 200;

// Global log store so we capture logs before the component mounts
const logStore = [];
let listeners = [];

function addLog(entry) {
  logStore.push(entry);
  if (logStore.length > MAX_ENTRIES) logStore.shift();
  listeners.forEach(fn => fn());
}

// Patch console methods once
if (!window.__debugLogPatched) {
  window.__debugLogPatched = true;
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  console.log = (...args) => {
    addLog({ level: 'log', msg: args.map(String).join(' '), ts: Date.now() });
    origLog.apply(console, args);
  };
  console.warn = (...args) => {
    addLog({ level: 'warn', msg: args.map(String).join(' '), ts: Date.now() });
    origWarn.apply(console, args);
  };
  console.error = (...args) => {
    addLog({ level: 'error', msg: args.map(String).join(' '), ts: Date.now() });
    origError.apply(console, args);
  };

  // Capture unhandled errors
  window.addEventListener('error', (e) => {
    addLog({ level: 'error', msg: `[Uncaught] ${e.message} (${e.filename}:${e.lineno})`, ts: Date.now() });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    addLog({ level: 'error', msg: `[Promise] ${e.reason}`, ts: Date.now() });
  });
}

// Export helper so PokemonImage can log directly
export function debugLog(level, msg) {
  addLog({ level, msg, ts: Date.now() });
}

const LEVEL_COLORS = {
  log: '#8f8',
  warn: '#ff0',
  error: '#f66',
  img: '#6cf',
};

export default function DebugLog() {
  const [open, setOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  });

  const clearLogs = () => {
    logStore.length = 0;
    forceUpdate(n => n + 1);
  };

  const errorCount = logStore.filter(e => e.level === 'error').length;

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 99999,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: 'none',
          background: errorCount > 0 ? '#c22' : '#333',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
        }}
        title="Debug Logs"
      >
        {errorCount > 0 ? `!${errorCount}` : '{ }'}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          bottom: 72,
          right: 8,
          left: 8,
          maxHeight: '60vh',
          zIndex: 99999,
          background: '#111',
          border: '1px solid #444',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#ccc',
          boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 10px',
            borderBottom: '1px solid #333',
            background: '#1a1a1a',
            borderRadius: '8px 8px 0 0',
          }}>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>Debug Log ({logStore.length})</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={clearLogs} style={{
                background: '#333', border: 'none', color: '#ccc',
                padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11,
              }}>Clear</button>
              <button onClick={() => setOpen(false)} style={{
                background: '#333', border: 'none', color: '#ccc',
                padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11,
              }}>X</button>
            </div>
          </div>
          <div ref={listRef} style={{
            overflowY: 'auto',
            padding: '4px 8px',
            flex: 1,
            maxHeight: 'calc(60vh - 36px)',
            WebkitOverflowScrolling: 'touch',
          }}>
            {logStore.length === 0 && (
              <div style={{ color: '#666', padding: 8 }}>No logs yet</div>
            )}
            {logStore.map((entry, i) => {
              const time = new Date(entry.ts);
              const ts = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
              return (
                <div key={i} style={{
                  padding: '2px 0',
                  borderBottom: '1px solid #222',
                  wordBreak: 'break-all',
                  color: LEVEL_COLORS[entry.level] || '#ccc',
                }}>
                  <span style={{ color: '#666' }}>{ts}</span>{' '}
                  <span style={{ color: LEVEL_COLORS[entry.level], fontWeight: entry.level === 'error' ? 'bold' : 'normal' }}>
                    [{entry.level}]
                  </span>{' '}
                  {entry.msg}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
