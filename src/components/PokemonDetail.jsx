import TypeBadge from './TypeBadge.jsx';
import StatBars from './StatBars.jsx';
import EvolutionChain from './EvolutionChain.jsx';

export default function PokemonDetail({ pokemon }) {
  if (!pokemon) return null;

  return (
    <div className="pokemon-detail">
      <div className="detail-header">
        <h2 className="pokemon-name">{pokemon.name}</h2>
        <span className="pokemon-id">#{String(pokemon.id).padStart(4, '0')}</span>
        {pokemon.is_legendary && <span className="badge legendary">Legendary</span>}
        {pokemon.is_mythical && <span className="badge mythical">Mythical</span>}
      </div>

      <p className="pokemon-genus">{pokemon.genus}</p>

      <div className="detail-types">
        {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
      </div>

      <div className="detail-section">
        <h3>Abilities</h3>
        <div className="abilities-list">
          {pokemon.abilities.map(a => (
            <span key={a.name} className="ability">
              {a.name}{a.is_hidden ? ' (Hidden)' : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h3>Base Stats</h3>
        <StatBars stats={pokemon.stats} />
      </div>

      <div className="detail-section">
        <h3>Evolution</h3>
        <EvolutionChain chain={pokemon.evolution_chain} />
      </div>

      <div className="detail-section">
        <h3>Level-Up Moves</h3>
        <div className="moves-list">
          {pokemon.moves.map((m, i) => (
            <div key={`${m.name}-${i}`} className="move-item">
              <span className="move-level">Lv. {m.level}</span>
              <span className="move-name">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
