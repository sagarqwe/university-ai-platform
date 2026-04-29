/**
 * File: frontend/src/components/shared/LanguageBadge.jsx
 */

const LANG_CONFIG = {
  en: { label: 'English', flag: '🇬🇧', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  hi: { label: 'Hindi',   flag: '🇮🇳', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  or: { label: 'Odia',    flag: '🏛️', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
};

export default function LanguageBadge({ code }) {
  const cfg = LANG_CONFIG[code] || { label: code, flag: '🌐', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      <span>{cfg.flag}</span>
      {cfg.label}
    </span>
  );
}
