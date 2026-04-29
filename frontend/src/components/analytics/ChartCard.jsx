/**
 * File: frontend/src/components/analytics/ChartCard.jsx
 * Purpose: Wrapper card for Recharts visualizations with consistent styling.
 * Used in: AnalyticsPage for all 4 charts.
 * Props:
 *   title: string
 *   subtitle: string (optional)
 *   icon: Lucide icon component
 *   loading: boolean
 *   children: chart content
 *   action: optional JSX action (e.g. a refresh button)
 */

import { Loader2 } from 'lucide-react';

export default function ChartCard({ title, subtitle, icon: Icon, loading, children, action }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-7 h-7 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-52 flex-1">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <p className="text-xs text-slate-600">Loading data…</p>
          </div>
        </div>
      ) : (
        <div className="flex-1">{children}</div>
      )}
    </div>
  );
}
