import { TYPE_COLORS } from '../utils/constants.js';

export default function TypeBadge({ type }) {
  const color = TYPE_COLORS[type] || '#777';
  return (
    <span className="type-badge" style={{ backgroundColor: color }}>
      {type}
    </span>
  );
}
