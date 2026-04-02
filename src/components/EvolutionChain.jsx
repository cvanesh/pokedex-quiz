import PokemonImage from './PokemonImage.jsx';

export default function EvolutionChain({ chain }) {
  if (!chain || chain.length <= 1) {
    return <p className="no-evolution">Does not evolve.</p>;
  }

  // Build tree: group by evolves_from
  const root = chain.find(c => !c.evolves_from);
  if (!root) return <p className="no-evolution">Does not evolve.</p>;

  const childrenOf = (parentId) =>
    chain.filter(c => c.evolves_from === parentId);

  // Render a stage (a pokemon and its descendants)
  const renderStage = (node) => {
    const children = childrenOf(node.id);

    return (
      <div key={node.id} className="evo-tree-row">
        <div className="evo-pokemon">
          <PokemonImage id={node.id} size="evo" alt={node.name} />
          <span className="evo-name">{node.name}</span>
        </div>

        {children.length > 0 && (
          <>
            <div className="evo-arrow-col">
              {children.map((child) => (
                <span key={child.id} className="evo-arrow">
                  {child.min_level ? `Lv.${child.min_level} →` : '→'}
                </span>
              ))}
            </div>
            <div className="evo-branch">
              {children.map(child => renderStage(child))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="evolution-chain">
      {renderStage(root)}
    </div>
  );
}
