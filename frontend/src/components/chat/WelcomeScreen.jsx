/**
 * File: WelcomeScreen.jsx — Original dark theme preserved + NIST logo + personalization
 */
import { useAuth } from '../../hooks/useAuth';
import { Globe, Shield, Zap, TrendingUp } from 'lucide-react';
import NIST_LOGO from '../../utils/logo';

const SUGGESTIONS = [
  { lang: 'GB', text: 'What is the fee structure for B.Tech CSE?' },
  { lang: 'IN', text: 'बी.टेक प्रवेश की अंतिम तिथि क्या है?' },
  { lang: 'GB', text: 'When is the semester examination schedule?' },
  { lang: '🏛️', text: 'ବ୍ୟାଚେଲର ଡିଗ୍ରୀ ପ୍ରବେଶ ପ୍ରକ୍ରିୟା କଣ?' },
];

export default function WelcomeScreen({ onSuggestion }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-4">

      {/* Logo */}
      <img src={NIST_LOGO} alt="NIST"
        className="w-14 h-14 rounded-2xl object-cover shadow-lg mb-5 animate-bounce-in logo-pulse" />

      <h2 className="text-xl font-bold text-white mb-2 text-center animate-fade-in-up delay-100">
        University AI Assistant
      </h2>

      {user?.name && (
        <p className="text-sm text-slate-400 mb-1">
          Hello, <span className="text-emerald-400 font-semibold">{user.name}</span>
          {user.branch && <span className="text-slate-500"> · {user.branch} Year {user.year}</span>}
        </p>
      )}

      <p className="text-sm text-slate-400 text-center mb-6 max-w-md leading-relaxed">
        Ask any question about admissions, fees, exams, hostels, or
        placements. I answer from official university documents.
      </p>

      {/* Feature badges — original style */}
      <div className="flex flex-wrap gap-2 justify-center mb-8 animate-fade-in delay-200">
        {[
          { icon: Globe,      label: 'Multilingual' },
          { icon: Shield,     label: 'Document-grounded' },
          { icon: Zap,        label: 'Confidence scores' },
          { icon: TrendingUp, label: 'Hallucination-safe' },
        ].map(({ icon: Icon, label }) => (
          <div key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700">
            <Icon className="w-3 h-3" />
            {label}
          </div>
        ))}
      </div>

      {/* TRY ASKING */}
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">
        TRY ASKING
      </p>

      <div className="w-full max-w-lg space-y-2">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => onSuggestion(s.text)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left
                       bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600
                       text-slate-300 transition-all stagger-item"
          >
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 flex-shrink-0">
              {s.lang}
            </span>
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}
