import { STAT_LABELS, STAT_COLORS } from '../utils/constants.js';

const MAX_STAT = 255;

export default function StatBars({ stats }) {
  return (
    <div className="stat-bars">
      {Object.entries(stats).map(([key, value]) => {
        const pct = Math.round((value / MAX_STAT) * 100);
        return (
          <div key={key} className="stat-row">
            <span className="stat-label">{STAT_LABELS[key] || key}</span>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${pct}%`,
                  backgroundColor: STAT_COLORS[key] || '#6390F0',
                }}
              />
            </div>
            <span className="stat-value">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
