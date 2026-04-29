/**
 * File: ChatInput.jsx — Original dark style with auto-resize
 */
import { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({ value, onChange, onSend, loading, language }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const placeholder = {
    auto: 'Ask in English, हिंदी, or ଓଡ଼ିଆ...',
    en:   'Ask your question in English...',
    hi:   'हिंदी में प्रश्न पूछें...',
    or:   'ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପଡ଼ନ୍ତୁ...',
  }[language] || 'Ask your question...';

  return (
    <div className="flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={loading}
        className="flex-1 resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                   text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500
                   focus:ring-1 focus:ring-indigo-500 transition-all"
        style={{ maxHeight: '120px' }}
      />
      <button onClick={onSend} disabled={loading || !value.trim()}
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all btn-lift btn-ripple
                   bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  );
}
