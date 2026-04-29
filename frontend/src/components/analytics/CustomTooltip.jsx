/**
 * File: frontend/src/components/analytics/CustomTooltip.jsx
 * Purpose: Styled Recharts tooltip used in all 4 analytics charts.
 * Recharts passes { active, payload, label } as props automatically.
 *
 * Usage in a chart:
 *   import CustomTooltip from '../components/analytics/CustomTooltip';
 *   <Tooltip content={<CustomTooltip />} />
 */

export default function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs shadow-2xl min-w-[120px]">
      {label && (
        <p className="text-slate-400 font-medium mb-2 pb-2 border-b border-slate-700">
          {label}
        </p>
      )}
      {payload.map((entry, i) => {
        let displayValue = entry.value;
        if (formatter) {
          displayValue = formatter(entry.value, entry.name);
        } else if (typeof entry.value === 'number') {
          // Auto-format: if value is between 0 and 1 (likely a ratio), show as %
          if (entry.value > 0 && entry.value <= 1 && entry.dataKey?.toLowerCase().includes('confidence')) {
            displayValue = `${Math.round(entry.value * 100)}%`;
          }
        }

        return (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-white">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}
