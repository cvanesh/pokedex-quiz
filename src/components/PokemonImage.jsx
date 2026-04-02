import { useState, useRef, useCallback, useEffect } from 'react';
import { IMAGE_FULL_URL, IMAGE_THUMB_URL } from '../utils/constants.js';

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

  // Only start loading when the container scrolls into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Large images (quiz/detail view) load immediately — no need to defer
    if (size === 'large') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [size]);

  // Clean up retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const handleError = useCallback(() => {
    if (retryCount.current < MAX_RETRIES) {
      retryCount.current += 1;
      const delay = retryCount.current * 1000 + Math.random() * 500;
      retryTimer.current = setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = '';
          imgRef.current.src = url;
        }
      }, delay);
    } else {
      setError(true);
    }
  }, [url]);

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
          onLoad={() => setLoaded(true)}
          onError={handleError}
          style={{ display: error ? 'none' : 'block' }}
        />
      )}
    </div>
  );
}
