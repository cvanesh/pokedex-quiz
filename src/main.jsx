import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/pokedex-quiz/sw.js')
      .then(reg => console.log(`[SW] registered, scope: ${reg.scope}`))
      .catch(err => console.error(`[SW] registration failed: ${err.message}`));
  });
}

// Log useful startup info for debugging
console.log(`[App] BASE_URL=${import.meta.env.BASE_URL}`);
console.log(`[App] location=${location.href}`);
console.log(`[App] userAgent=${navigator.userAgent}`);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
