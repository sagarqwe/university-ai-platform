/**
 * File: SessionSidebar.jsx
 * Purpose: Lists previous chat sessions. Props fixed to match StudentDashboard.
 */
import { Plus, MessageSquare, Clock, X } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

export default function SessionSidebar({ sessions, currentSessionId, onSelect, onClose, onNew }) {
  return (
    <div className="w-64 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-white">Chat History</span>
        </div>
        <button onClick={onClose}
          className="p-1 text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New session button */}
      <button onClick={onNew}
        className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 rounded-lg
                   border border-dashed border-slate-700 text-slate-400
                   hover:text-white hover:border-slate-600 transition-all text-sm">
        <Plus className="w-4 h-4" />
        New Chat
      </button>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-6 h-6 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No previous sessions</p>
          </div>
        ) : (
          sessions.map(s => (
            <button key={s.sessionId} onClick={() => onSelect(s.sessionId)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all
                ${currentSessionId === s.sessionId
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <p className="font-medium truncate">Session {s.sessionId?.slice(-8)}</p>
              <p className="opacity-60 mt-0.5">
                {s.messageCount} messages · {formatTime(s.lastActivity)}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
