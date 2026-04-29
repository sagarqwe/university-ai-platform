/**
 * File: frontend/src/components/shared/ConfidenceBadge.jsx
 * Purpose: Displays AI confidence score with color-coded styling.
 * High ≥ 0.75 → green, Mid ≥ 0.45 → amber, Low < 0.45 → red
 */

export default function ConfidenceBadge({ score, showLabel = true }) {
  if (score == null) return null;

  const pct = Math.round(score * 100);

  const tier =
    pct >= 75 ? { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'High' } :
    pct >= 45 ? { color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   label: 'Medium' } :
                { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     label: 'Low' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${tier.bg} ${tier.border} ${tier.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${pct >= 75 ? 'bg-emerald-400' : pct >= 45 ? 'bg-amber-400' : 'bg-red-400'}`} />
      {pct}%
      {showLabel && <span className="opacity-70">{tier.label}</span>}
    </span>
  );
}
