/**
 * File: MessageBubble.jsx — Original dark theme + sentiment + transparency
 */
import { useState } from 'react';
import { formatTime } from '../../utils/helpers';
import { ChevronDown, ChevronUp, AlertTriangle, FileText } from 'lucide-react';

const CONF_STYLE = {
  high:   { label: '✓ Verified',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: '~ Moderate',  cls: 'text-amber-400   bg-amber-500/10   border-amber-500/20'   },
  low:    { label: '⚠ Low',       cls: 'text-rose-400    bg-rose-500/10    border-rose-500/20'     },
};

const LANG_BADGE = {
  hi: { label: '🇮🇳 Hindi',   cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  or: { label: '🏛️ Odia',    cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  en: { label: '🇬🇧 English', cls: 'bg-blue-500/10   text-blue-400   border-blue-500/20'   },
};

const SENTIMENT_ICON = {
  POSITIVE: '😊',
  NEUTRAL:  '😐',
  NEGATIVE: '😟',
};

function getLevel(score) {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'USER';
  const [showChunks, setShowChunks] = useState(false);

  if (isUser) {
    return (
      <div className="flex justify-end msg-user">
        <div className="max-w-[75%]">
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white bg-indigo-600 shadow-sm shadow-indigo-500/20">
            {message.content}
          </div>
          <p className="text-xs text-slate-500 mt-1 text-right">
            {formatTime(message.timestamp)}
            {message.sentiment && SENTIMENT_ICON[message.sentiment] && (
              <span className="ml-1">{SENTIMENT_ICON[message.sentiment]}</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // AI message
  const level     = message.confidenceScore !== undefined ? getLevel(message.confidenceScore) : null;
  const confStyle = level ? CONF_STYLE[level] : null;
  const langBadge = LANG_BADGE[message.detectedLanguage] || LANG_BADGE.en;

  return (
    <div className="flex justify-start msg-ai">
      <div className="max-w-[80%]">
        {/* Avatar */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AI
          </div>
          <span className="text-xs text-slate-500 font-medium">NIST Assistant</span>
        </div>

        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl rounded-tl-sm text-sm shadow-sm ${
          message.fallback
            ? 'bg-rose-950/40 border border-rose-500/20 text-rose-100'
            : 'bg-slate-800 border border-slate-700 text-slate-100'
        }`}>
          {message.fallback && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-rose-400">
                Not found in official documents
              </span>
            </div>
          )}
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-xs text-slate-600">{formatTime(message.timestamp)}</span>

          {confStyle && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${confStyle.cls}`}>
              {Math.round((message.confidenceScore || 0) * 100)}% · {confStyle.label}
            </span>
          )}

          {message.detectedLanguage && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${langBadge.cls}`}>
              {langBadge.label}
            </span>
          )}

          {/* Transparency — show sources */}
          {message.retrievedChunks && message.retrievedChunks.length > 0 && (
            <button onClick={() => setShowChunks(s => !s)}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
              <FileText className="w-3 h-3" />
              {showChunks ? 'Hide' : 'Show'} sources
              {showChunks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Source chunks */}
        {showChunks && message.retrievedChunks && (
          <div className="mt-2 space-y-2 animate-fade-in-up">
            {message.retrievedChunks.map((chunk, i) => (
              <div key={i} className="text-xs p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">Source {i + 1}</p>
                <p className="leading-relaxed">{chunk.slice(0, 200)}…</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
