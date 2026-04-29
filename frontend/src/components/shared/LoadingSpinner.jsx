/**
 * File: frontend/src/components/shared/LoadingSpinner.jsx
 * Purpose: Reusable loading spinner and skeleton loaders.
 * Used throughout the app for async states.
 */

import { Loader2 } from 'lucide-react';

/**
 * Full-page loading overlay. Use for initial page loads.
 */
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 gap-3">
      <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

/**
 * Inline spinner. Use inside buttons or cards.
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' };
  return <Loader2 className={`animate-spin text-indigo-400 ${sizes[size]} ${className}`} />;
}

/**
 * Skeleton block for card loading states.
 */
export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
  );
}

/**
 * Skeleton set for metric cards row.
 */
export function MetricCardSkeletons({ count = 4 }) {
  return (
    <div className={`grid grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export default Spinner;
