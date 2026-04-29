/**
 * File: frontend/src/components/admin/MetricCard.jsx
 * Purpose: Reusable metrics card for admin dashboard statistics.
 * Props:
 *   title: string
 *   value: string | number
 *   subtitle: string (optional)
 *   icon: Lucide icon component
 *   color: 'indigo' | 'emerald' | 'amber' | 'violet' | 'rose'
 *   trend: { value: number, label: string } (optional, shows % change)
 */

import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
  indigo:  {
    bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',
    text: 'text-indigo-400', icon: 'bg-indigo-500/20 text-indigo-400',
  },
  emerald: {
    bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    text: 'text-emerald-400', icon: 'bg-emerald-500/20 text-emerald-400',
  },
  amber:   {
    bg: 'bg-amber-500/10',   border: 'border-amber-500/20',
    text: 'text-amber-400',  icon: 'bg-amber-500/20 text-amber-400',
  },
  violet:  {
    bg: 'bg-violet-500/10',  border: 'border-violet-500/20',
    text: 'text-violet-400', icon: 'bg-violet-500/20 text-violet-400',
  },
  rose:    {
    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',
    text: 'text-rose-400',   icon: 'bg-rose-500/20 text-rose-400',
  },
};

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 backdrop-blur-sm`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <p className={`text-3xl font-bold ${c.text}`}>{value ?? '—'}</p>

      <div className="flex items-center justify-between mt-2">
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.value >= 0
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
