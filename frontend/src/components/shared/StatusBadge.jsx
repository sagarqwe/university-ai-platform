/**
 * File: frontend/src/components/shared/StatusBadge.jsx
 * Purpose: Status indicator badges — online/offline/loading states.
 * Used in: Layout topbar, StudentDashboard AI status panel.
 */

export function StatusDot({ status = 'online' }) {
  const config = {
    online:  { color: 'bg-emerald-400', pulse: true,  label: 'Online' },
    offline: { color: 'bg-red-400',     pulse: false, label: 'Offline' },
    loading: { color: 'bg-amber-400',   pulse: true,  label: 'Connecting' },
    unknown: { color: 'bg-slate-500',   pulse: false, label: 'Unknown' },
  };
  const c = config[status] || config.unknown;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`relative flex h-2 w-2`}>
        {c.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.color} opacity-60`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.color}`} />
      </span>
      <span className="text-slate-400">{c.label}</span>
    </span>
  );
}

/**
 * Pill badge for general statuses.
 */
export function StatusPill({ children, variant = 'neutral' }) {
  const variants = {
    success: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    warning: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    error:   'bg-red-400/10 text-red-400 border-red-400/20',
    info:    'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
    neutral: 'bg-slate-700/50 text-slate-400 border-slate-700',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}

export default StatusDot;
