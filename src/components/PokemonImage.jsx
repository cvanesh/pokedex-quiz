import { useState, useRef, useCallback, useEffect } from 'react';
import { IMAGE_FULL_URL, IMAGE_THUMB_URL } from '../utils/constants.js';
import { debugLog } from './DebugLog.jsx';

const MAX_RETRIES = 3;

export default function PokemonImage({ id, size = 'large', alt = 'Pokémon' }) {
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const retryCount = useRef(0);
  const retryTimer = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const baseUrl = size === 'large' ? IMAGE_FULL_URL : IMAGE_THUMB_URL;
  const url = `${baseUrl}${id}.png`;
  const sizeClass = `pokemon-img-${size}`;

  debugLog('img', `[IMG] mount id=${id} size=${size} url=${url}`);

  // Only start loading when the container scrolls into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Large images (quiz/detail view) load immediately — no need to defer
    if (size === 'large') {
      setVisible(true);
      debugLog('img', `[IMG] id=${id} visible immediately (large)`);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          debugLog('img', `[IMG] id=${id} now visible (intersected)`);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [size, id]);

  // Clean up retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const handleLoad = useCallback(() => {
    debugLog('img', `[IMG] id=${id} loaded OK — ${url}`);
    setLoaded(true);
  }, [id, url]);

  const handleError = useCallback(() => {
    if (retryCount.current < MAX_RETRIES) {
      retryCount.current += 1;
      debugLog('warn', `[IMG] id=${id} failed, retry ${retryCount.current}/${MAX_RETRIES} — ${url}`);
      const delay = retryCount.current * 1000 + Math.random() * 500;
      retryTimer.current = setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = '';
          imgRef.current.src = url;
        }
      }, delay);
    } else {
      debugLog('error', `[IMG] id=${id} GAVE UP after ${MAX_RETRIES} retries — ${url}`);
      // Try a direct fetch to get the HTTP status for debugging
      fetch(url, { mode: 'no-cors' }).then(r => {
        debugLog('error', `[IMG] id=${id} fetch status=${r.status} type=${r.type} url=${url}`);
      }).catch(e => {
        debugLog('error', `[IMG] id=${id} fetch error: ${e.message}`);
      });
      setError(true);
    }
  }, [url, id]);

  return (
    <div ref={containerRef} className={`pokemon-image-container ${sizeClass}`}>
      {(!visible || (!loaded && !error)) && <div className="pokeball-spinner" />}
      {error && (
        <div className="image-error">
          <div className="silhouette">?</div>
        </div>
      )}
      {visible && (
        <img
          ref={imgRef}
          src={url}
          alt={alt}
          className={`pokemon-img ${loaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: error ? 'none' : 'block' }}
        />
      )}
    </div>
  );
}
