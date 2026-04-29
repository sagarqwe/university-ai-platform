/**
 * File: frontend/src/components/shared/EmptyState.jsx
 * Purpose: Consistent empty state component for tables, lists, charts.
 * Used when there is no data to show — avoids blank white boxes.
 */

export default function EmptyState({
  icon: Icon,
  title = 'No data yet',
  description = '',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-slate-600" />
        </div>
      )}
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {description && (
        <p className="text-xs text-slate-600 mt-1 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}
