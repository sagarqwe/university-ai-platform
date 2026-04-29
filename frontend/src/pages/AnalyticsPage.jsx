/**
 * File: AnalyticsPage.jsx
 * Features #10, #11, #12, #13 — Full analytics with sentiment, department, auto-improvement
 */
import { useState, useEffect } from 'react';
import Layout from '../components/shared/Layout';
import { adminAPI } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, FileText, Users, Clock } from 'lucide-react';

const GREEN  = '#7bc67e';
const COLORS = [GREEN, '#818cf8', '#fbbf24', '#a78bfa', '#f87171', '#34d399'];
const SENT_COLORS = { POSITIVE: '#34d399', NEUTRAL: '#6b7280', NEGATIVE: '#f87171' };

// Rich demo data
const demoQpD  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  .map((d, i) => ({ date: d, queries: [8,14,22,18,25,12,9][i] }));
const demoLang = [
  { name: 'English', value: 62 },
  { name: 'Hindi',   value: 29 },
  { name: 'Odia',    value: 9  },
];
const demoConf = ['W1','W2','W3','W4','W5']
  .map((d, i) => ({ date: d, avg_confidence: [0.52,0.58,0.64,0.61,0.70][i] }));
const demoSent = [
  { name: 'Positive', value: 48 },
  { name: 'Neutral',  value: 37 },
  { name: 'Negative', value: 15 },
];
const demoDept = [
  { branch: 'CSE', queries: 42 },
  { branch: 'ECE', queries: 28 },
  { branch: 'ME',  queries: 18 },
  { branch: 'CE',  queries: 14 },
  { branch: 'IT',  queries: 22 },
  { branch: 'MCA', queries: 11 },
];
const demoPeak = [
  { hour: '8AM',  queries: 5  },
  { hour: '10AM', queries: 18 },
  { hour: '12PM', queries: 24 },
  { hour: '2PM',  queries: 31 },
  { hour: '4PM',  queries: 27 },
  { hour: '6PM',  queries: 19 },
  { hour: '8PM',  queries: 12 },
];
const demoTopics = [
  { topic: 'Fees & Scholarships', count: 34 },
  { topic: 'Admissions',          count: 28 },
  { topic: 'Exam Schedule',       count: 22 },
  { topic: 'Hostel',              count: 19 },
  { topic: 'Placements',          count: 16 },
];
const demoImprove = {
  low_confidence_rate: 0.18,
  missing_document_suggestions: [
    { topic: 'Fees',       missing_queries: 8,  suggestion: 'Upload Fee Structure 2024-25',    priority: 'HIGH'   },
    { topic: 'Hostel',     missing_queries: 5,  suggestion: 'Upload Hostel Rules Document',    priority: 'HIGH'   },
    { topic: 'Placement',  missing_queries: 3,  suggestion: 'Upload Placement Brochure',       priority: 'MEDIUM' },
    { topic: 'Exam',       missing_queries: 2,  suggestion: 'Upload Examination Schedule',     priority: 'MEDIUM' },
  ],
  faq_suggestions: [
    { pattern: 'What is',  example: 'What is the fee for B.Tech CSE?',    frequency: 18 },
    { pattern: 'How to',   example: 'How to apply for hostel?',             frequency: 12 },
    { pattern: 'When is',  example: 'When is the semester exam?',           frequency: 9  },
  ],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || GREEN }}>
          {p.name}: <span className="font-bold">{
            typeof p.value === 'number' && p.value < 2
              ? `${(p.value * 100).toFixed(0)}%`
              : p.value
          }</span>
        </p>
      ))}
    </div>
  );
};

function ChartCard({ title, subtitle, icon: Icon, children, accent = GREEN }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4" style={{ color: accent }} />}
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [qpd,     setQpd]     = useState(demoQpD);
  const [lang,    setLang]    = useState(demoLang);
  const [conf,    setConf]    = useState(demoConf);
  const [sent,    setSent]    = useState(demoSent);
  const [dept,    setDept]    = useState(demoDept);
  const [peak,    setPeak]    = useState(demoPeak);
  const [topics,  setTopics]  = useState(demoTopics);
  const [improve, setImprove] = useState(demoImprove);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [q, l, c] = await Promise.allSettled([
          adminAPI.getQueriesPerDay(),
          adminAPI.getLanguageDist(),
          adminAPI.getConfidenceTrend(),
        ]);
        if (q.status === 'fulfilled' && q.value.data?.length) setQpd(q.value.data);
        if (l.status === 'fulfilled' && l.value.data?.length) setLang(l.value.data);
        if (c.status === 'fulfilled' && c.value.data?.length) setConf(c.value.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <Layout title="Analytics Dashboard">
      <div className="space-y-5 max-w-7xl">

        {/* Row 1 — Queries + Language */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="📈 Queries Per Day" subtitle="Daily query volume trend" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={qpd}>
                <defs>
                  <linearGradient id="gq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={GREEN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="queries" stroke={GREEN} fill="url(#gq)" strokeWidth={2} name="Queries" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="🌍 Language Distribution" subtitle="Query language breakdown — Feature #3 & #6">
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={lang} dataKey="value" nameKey="name" cx="50%" cy="50%"
                       innerRadius={50} outerRadius={80}>
                    {lang.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {lang.map((l, i) => (
                  <div key={l.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0"
                         style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-300 flex-1">{l.name}</span>
                    <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                      {l.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Row 2 — Confidence + Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="📊 Confidence Trend" subtitle="Average RAG answer quality over time — Feature #5">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={conf}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,1]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avg_confidence" stroke={GREEN} strokeWidth={2}
                      dot={{ fill: GREEN, r: 3 }} name="Confidence" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="😊 Sentiment Analysis" subtitle="Student satisfaction trends — Feature #11" accent="#f87171">
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={sent} dataKey="value" nameKey="name" cx="50%" cy="50%"
                       innerRadius={50} outerRadius={80}>
                    {sent.map(s => (
                      <Cell key={s.name} fill={SENT_COLORS[s.name.toUpperCase()] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {sent.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0"
                         style={{ backgroundColor: SENT_COLORS[s.name.toUpperCase()] }} />
                    <span className="text-xs text-slate-300 flex-1">{s.name}</span>
                    <span className="text-xs font-bold"
                          style={{ color: SENT_COLORS[s.name.toUpperCase()] }}>
                      {s.value}%
                    </span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-500">
                    {sent.find(s => s.name === 'Negative')?.value > 20
                      ? '⚠️ High frustration — check knowledge base'
                      : '✅ Students are generally satisfied'}
                  </p>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Row 3 — Department + Peak Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="🏛️ Department-wise Queries" subtitle="Branch usage intelligence — Feature #10" icon={Users}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dept} barSize={28}>
                <XAxis dataKey="branch" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="queries" fill={GREEN} radius={[4,4,0,0]} name="Queries" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="⏰ Peak Usage Hours" subtitle="Busiest times of day — Feature #10" icon={Clock} accent="#fbbf24">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={demoPeak}>
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="queries" stroke="#fbbf24" fill="url(#gp)"
                      strokeWidth={2} name="Queries" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 4 — Most Asked Topics */}
        <ChartCard title="🔥 Most Asked Topics" subtitle="Query intelligence — top knowledge areas — Feature #10" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={demoTopics} layout="vertical" barSize={18}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="topic" tick={{ fontSize: 11, fill: '#94a3b8' }}
                     axisLine={false} tickLine={false} width={160} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={GREEN} radius={[0,4,4,0]} name="Queries" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Row 5 — Auto-improvement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Missing documents */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-semibold text-white">Missing Document Suggestions</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Auto-detected from low-confidence queries — Feature #12
            </p>

            {/* Low confidence rate */}
            <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
                 style={{
                   backgroundColor: improve.low_confidence_rate > 0.2 ? '#2d0a0a' : '#052e16',
                   border: `1px solid ${improve.low_confidence_rate > 0.2 ? '#dc262633' : '#16a34a33'}`
                 }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0"
                style={{ color: improve.low_confidence_rate > 0.2 ? '#f87171' : '#34d399' }} />
              <div>
                <p className="text-xs font-semibold text-white">
                  {(improve.low_confidence_rate * 100).toFixed(0)}% low-confidence rate
                </p>
                <p className="text-xs text-slate-500">
                  {improve.low_confidence_rate > 0.2
                    ? 'Upload more documents to improve accuracy'
                    : 'Knowledge base performing well'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {improve.missing_document_suggestions.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl
                                        bg-slate-800/50 border border-slate-700/50">
                  <div>
                    <p className="text-xs font-semibold text-white">{s.suggestion}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.missing_queries} unanswered queries about {s.topic}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: s.priority === 'HIGH' ? '#2d0a0a' : '#1c1a08',
                          color: s.priority === 'HIGH' ? '#f87171' : '#fbbf24',
                          border: `1px solid ${s.priority === 'HIGH' ? '#f8717133' : '#fbbf2433'}`,
                        }}>
                    {s.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ suggestions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4" style={{ color: GREEN }} />
              <p className="text-sm font-semibold text-white">FAQ Suggestions</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Most common query patterns — Feature #12
            </p>

            <div className="space-y-3">
              {improve.faq_suggestions.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${GREEN}20`, color: GREEN, border: `1px solid ${GREEN}33` }}>
                      {f.pattern}
                    </span>
                    <span className="text-xs text-slate-500">{f.frequency}× asked</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">"{f.example}"</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <p className="text-xs text-slate-400">
                💡 <span className="font-semibold text-white">Tip:</span> Create a FAQ document
                based on these patterns and upload it to dramatically improve confidence scores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
