import { IMAGE_BASE_URL } from '../utils/constants.js';

export default function EvolutionChain({ chain }) {
  if (!chain || chain.length <= 1) {
    return <p className="no-evolution">Does not evolve.</p>;
  }

  // Build a simple linear display; for branching, group by evolves_from
  const root = chain.find(c => !c.evolves_from && !c.min_level && chain.indexOf(c) === 0);

  return (
    <div className="evolution-chain">
      {chain.map((stage, i) => (
        <div key={stage.id} className="evo-step">
          {i > 0 && (
            <span className="evo-arrow">
              →{stage.min_level ? ` Lv.${stage.min_level} ` : ' '}→
            </span>
          )}
          <div className="evo-pokemon">
            <img
              src={`${IMAGE_BASE_URL}${stage.id}.png`}
              alt={stage.name}
              className="evo-img"
            />
            <span className="evo-name">{stage.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
