/**
 * File: StudentDashboard.jsx — Original dark theme + new features
 * Feature #17: Chat UI, language selector, confidence display, session history,
 *              personalization hint, system status, sentiment, transparency
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/shared/Layout';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import SessionSidebar from '../components/chat/SessionSidebar';
import WelcomeScreen from '../components/chat/WelcomeScreen';
import { chatAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { parseApiError } from '../utils/helpers';
import { History, Plus, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'auto', label: 'Auto',    flag: '🌐' },
  { code: 'en',   label: 'English', flag: 'GB' },
  { code: 'hi',   label: 'हिंदी',  flag: 'IN' },
  { code: 'or',   label: 'ଓଡ଼ିଆ',  flag: '🏛️' },
];

export default function StudentDashboard() {
  const [messages,    setMessages]    = useState([]);
  const [query,       setQuery]       = useState('');
  const [language,    setLanguage]    = useState('auto');
  const [sessionId,   setSessionId]   = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [aiStatus,    setAiStatus]    = useState('online');
  const [sessions,    setSessions]    = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const { user }       = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    loadSessions();
    startNewSession();
  }, []);

  const loadSessions = async () => {
    try { const res = await chatAPI.getSessions(); setSessions(res.data || []); } catch {}
  };

  const startNewSession = useCallback(async () => {
    try { const res = await chatAPI.createSession(); setSessionId(res.data.sessionId); } catch {}
  }, []);

  const loadHistory = async (sid) => {
    try {
      const res = await chatAPI.getHistory(sid);
      setMessages(res.data.map(m => ({
        role: m.role, content: m.content,
        confidenceScore: m.confidenceScore, detectedLanguage: m.detectedLanguage,
        fallback: m.fallback, timestamp: m.timestamp, sentiment: m.sentiment,
      })));
      setSessionId(sid);
      setShowHistory(false);
    } catch { toast.error('Could not load session'); }
  };

  const handleSend = async () => {
    const q = query.trim();
    if (!q || loading) return;

    const userMsg = { role: 'USER', content: q, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const profile = {};
      if (user?.branch) profile.branch = user.branch;
      if (user?.year)   profile.year   = user.year;
      if (user?.course) profile.course = user.course;

      const res  = await chatAPI.query(q, language, sessionId, profile);
      const data = res.data;
      if (!sessionId && data.sessionId) setSessionId(data.sessionId);

      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        content: data.answer,
        confidenceScore: data.confidence,
        detectedLanguage: data.detectedLanguage,
        fallback: data.fallback,
        timestamp: data.timestamp || new Date().toISOString(),
        sentiment: data.sentiment,
        sentimentScore: data.sentimentScore,
        retrievedChunks: data.retrievedChunks || [],
      }]);
      setAiStatus('online');
      loadSessions();
    } catch (err) {
      toast.error(parseApiError(err));
      setMessages(prev => prev.slice(0, -1));
      setAiStatus('offline');
    } finally { setLoading(false); }
  };

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <Layout title="Student Chat Portal">
      <div className="flex gap-4" style={{ height: 'calc(100vh - 7rem)' }}>

        {/* Session sidebar */}
        {showHistory && (
          <SessionSidebar
            sessions={sessions}
            currentSessionId={sessionId}
            onSelect={loadHistory}
            onClose={() => setShowHistory(false)}
            onNew={() => { setMessages([]); startNewSession(); setShowHistory(false); }}
          />
        )}

        {/* Main chat — original dark style */}
        <div className="flex-1 flex flex-col rounded-xl overflow-hidden bg-slate-900 border border-slate-800 animate-scale-in">

          {/* Toolbar — original style */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(s => !s)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <History className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setMessages([]); startNewSession(); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <Plus className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-slate-700 mx-1" />

              {/* Language buttons — original style */}
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all
                    ${language === lang.code
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <span className="text-xs">{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Personalization pill */}
              {user?.branch && (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {user.branch} · Y{user.year}
                </span>
              )}
              {/* Status dot */}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${aiStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span className="text-xs text-slate-500">{aiStatus === 'online' ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
              <WelcomeScreen onSuggestion={(s) => setQuery(s)} />
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 flex-shrink-0">
            <ChatInput
              value={query}
              onChange={setQuery}
              onSend={handleSend}
              loading={loading}
              language={language}
            />
            <p className="text-xs text-slate-600 text-center mt-2">
              Enter to send · Shift+Enter for new line · Language: {selectedLang.label}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
