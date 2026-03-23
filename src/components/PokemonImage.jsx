import { useState } from 'react';
import { IMAGE_BASE_URL } from '../utils/constants.js';

export default function PokemonImage({ id, size = 'large', alt = 'Pokémon' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const url = `${IMAGE_BASE_URL}${id}.png`;
  const sizeClass = `pokemon-img-${size}`;

  return (
    <div className={`pokemon-image-container ${sizeClass}`}>
      {!loaded && !error && <div className="pokeball-spinner" />}
      {error && (
        <div className="image-error">
          <div className="silhouette">?</div>
        </div>
      )}
      <img
        src={url}
        alt={alt}
        className={`pokemon-img ${loaded ? 'loaded' : 'loading'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: error ? 'none' : 'block' }}
      />
    </div>
  );
}
