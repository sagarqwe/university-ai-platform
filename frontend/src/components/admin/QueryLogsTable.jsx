/**
 * File: QueryLogsTable.jsx
 * Feature #14 — Chat Logging: shows query, response, confidence, language, sentiment, timestamp, user.
 */
import ConfidenceBadge from '../shared/ConfidenceBadge';
import LanguageBadge from '../shared/LanguageBadge';
import EmptyState from '../shared/EmptyState';
import { MessageSquare } from 'lucide-react';
import { truncate, formatDate, formatTime } from '../../utils/helpers';

const SENTIMENT_STYLE = {
  POSITIVE: { label: '😊 Positive',   color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
  NEUTRAL:  { label: '😐 Neutral',    color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
  NEGATIVE: { label: '😟 Frustrated', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
};

const HEADERS = ['User', 'Query', 'Confidence', 'Language', 'Sentiment', 'Time'];

export default function QueryLogsTable({ logs, loading }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-800">
            {HEADERS.map(h => (
              <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-800">
                {[100, 200, 80, 80, 90, 90].map((w, j) => (
                  <td key={j} className="px-3 py-3">
                    <div className="h-3 bg-slate-800 rounded animate-pulse" style={{ width: w }} />
                  </td>
                ))}
              </tr>
            ))
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4">
                <EmptyState
                  icon={MessageSquare}
                  title="No queries yet"
                  description="Student queries will appear here once the system receives requests."
                />
              </td>
            </tr>
          ) : (
            logs.map((log, i) => {
              const sent = SENTIMENT_STYLE[log.sentiment] || SENTIMENT_STYLE.NEUTRAL;
              return (
                <tr key={log.id || i} className="hover:bg-slate-800/40 transition-colors">
                  {/* User */}
                  <td className="px-3 py-3 text-slate-400 font-mono">
                    {log.user?.split('@')[0] || log.userName?.split('@')[0] || 'student'}
                  </td>

                  {/* Query */}
                  <td className="px-3 py-3 text-slate-200 max-w-[180px]">
                    <span title={log.query}>{truncate(log.query || log.content, 50)}</span>
                  </td>

                  {/* Confidence */}
                  <td className="px-3 py-3">
                    {log.confidence != null
                      ? <ConfidenceBadge score={log.confidence} showLabel={false} />
                      : <span className="text-slate-700">—</span>
                    }
                  </td>

                  {/* Language */}
                  <td className="px-3 py-3">
                    {(log.language || log.detectedLanguage)
                      ? <LanguageBadge code={log.language || log.detectedLanguage} />
                      : <span className="text-slate-700">—</span>
                    }
                  </td>

                  {/* Sentiment — Feature #11 */}
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ color: sent.color, backgroundColor: sent.bg, border: `1px solid ${sent.border}` }}>
                      {sent.label}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                    <span>{formatDate(log.timestamp)}</span>
                    <span className="text-slate-700 ml-1">{formatTime(log.timestamp)}</span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
