/**
 * File: TypingIndicator.jsx — Animated typing dots
 */
export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in-left">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 animate-scale-in"
             style={{ backgroundColor: '#7bc67e' }}>AI</div>
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
             style={{ backgroundColor: '#f0faf0', border: '1px solid #c8e6c9' }}>
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
