/**
 * File: frontend/src/pages/AdminDashboard.jsx
 * Feature #18 — Admin Dashboard — original dark theme preserved + new features added
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import { adminAPI } from '../services/api';
import { parseApiError, formatTime, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  FileText, Users, Activity, Zap, Upload, RefreshCw,
  BarChart2, Trash2, CheckCircle, Clock, AlertTriangle,
  ArrowUpRight, Database, TrendingUp, MessageSquare, CloudUpload
} from 'lucide-react';

const SENTIMENT_BADGE = {
  POSITIVE: { color: '#22c55e', bg: '#052e16', label: '😊 Positive' },
  NEUTRAL:  { color: '#6b7280', bg: '#1f2937', label: '😐 Neutral'  },
  NEGATIVE: { color: '#ef4444', bg: '#2d0a0a', label: '😟 Frustrated' },
};

function MetricCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    indigo:  { text: '#818cf8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.15)'  },
    emerald: { text: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.15)'  },
    amber:   { text: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.15)'  },
    violet:  { text: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)' },
    green:   { text: '#7bc67e', bg: 'rgba(123,198,126,0.08)', border: 'rgba(123,198,126,0.15)' },
    rose:    { text: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="rounded-xl p-5 flex flex-col gap-2 stagger-item card-hover"
         style={{ backgroundColor: '#0f172a', border: `1px solid ${c.border}`, background: `linear-gradient(135deg, #0f172a 0%, ${c.bg} 100%)` }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.bg }}>
          <Icon className="w-4 h-4" style={{ color: c.text }} />
        </div>
      </div>
      <p className="text-3xl font-bold metric-value" style={{ color: c.text }}>{value ?? '—'}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [overview,   setOverview]   = useState(null);
  const [documents,  setDocuments]  = useState([]);
  const [queryLogs,  setQueryLogs]  = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [dragOver,   setDragOver]   = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ovRes, docsRes, logsRes] = await Promise.allSettled([
        adminAPI.getOverview(), adminAPI.getDocuments(), adminAPI.getQueryLogs(25),
      ]);
      if (ovRes.status   === 'fulfilled') setOverview(ovRes.value.data);
      if (docsRes.status === 'fulfilled') setDocuments(docsRes.value.data || []);
      if (logsRes.status === 'fulfilled') setQueryLogs(logsRes.value.data || []);
    } catch { toast.error('Failed to load dashboard'); }
    finally  { setLoading(false); }
  };

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files accepted'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await adminAPI.uploadDocument(fd);
      toast.success(`✅ Uploaded: ${file.name}`);
      await loadAll();
    } catch (err) { toast.error(parseApiError(err)); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleFileInput = (e) => uploadFile(e.target.files[0]);
  const handleDrop      = (e) => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]); };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const res = await adminAPI.reindex();
      toast.success(`🔄 Indexed ${res.data?.chunksIndexed ?? 0} chunks from ${res.data?.documents ?? 0} docs`);
      await loadAll();
    } catch (err) { toast.error(parseApiError(err)); }
    finally { setReindexing(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await adminAPI.deleteDocument(id); toast.success('Deleted'); setDocuments(p => p.filter(d => d.id !== id)); }
    catch { toast.error('Delete failed'); }
  };

  const avgConf = overview?.averageConfidence != null
    ? `${Math.round(overview.averageConfidence * 100)}%` : '—';

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6 max-w-7xl animate-fade-in-up">

        {/* ── Metrics Row 1 ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Documents" value={loading ? '…' : overview?.totalDocuments}  subtitle="PDFs in knowledge base"    icon={FileText}      color="indigo" />
          <MetricCard title="Total Queries"   value={loading ? '…' : overview?.totalQueries}    subtitle="All-time student queries"  icon={Activity}      color="emerald" />
          <MetricCard title="Avg Confidence"  value={loading ? '…' : avgConf}                   subtitle="RAG answer quality"        icon={Zap}           color="amber" />
          <MetricCard title="Active Sessions" value={loading ? '…' : overview?.activeSessions}  subtitle="Open chat sessions"        icon={Users}         color="violet" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Knowledge Base ────────────────────────────────── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col animate-fade-in-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Knowledge Base</h2>
                <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-md">
                  {documents.length} docs
                </span>
              </div>
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" id="pdf-upload" />
                <label htmlFor="pdf-upload"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all btn-lift
                    ${uploading ? 'bg-slate-700 text-slate-400 pointer-events-none' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                  {uploading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Uploading…</> : <><Upload className="w-3 h-3" /> Upload PDF</>}
                </label>
                <button onClick={handleReindex} disabled={reindexing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg transition-all disabled:opacity-50 btn-lift">
                  {reindexing ? <><RefreshCw className="w-3 h-3 animate-spin" /> Indexing…</> : <><RefreshCw className="w-3 h-3" /> Reindex</>}
                </button>
              </div>
            </div>

            {/* Drag-drop zone */}
            <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg p-4 mb-4 flex items-center gap-3 transition-all"
              style={{ border: `2px dashed ${dragOver ? '#818cf8' : '#334155'}`, backgroundColor: dragOver ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
              <CloudUpload className="w-5 h-5 text-slate-500" />
              <p className="text-xs text-slate-500">Drop PDF here or click Upload PDF above</p>
            </div>

            {/* Document list */}
            <div className="flex-1 space-y-2 max-h-64 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 text-slate-600 animate-spin" /></div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No documents uploaded yet</p>
                  <p className="text-xs text-slate-600 mt-1">Upload PDFs to build the AI knowledge base</p>
                </div>
              ) : (
                documents.map((doc, i) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all stagger-item">
                    <div className="w-8 h-8 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{doc.originalFilename || doc.filename}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{doc.fileSizeBytes ? `${Math.round(doc.fileSizeBytes/1024)} KB` : ''}</span>
                        {doc.uploadedAt && <span className="text-xs text-slate-600">· {formatDate(doc.uploadedAt)}</span>}
                      </div>
                    </div>
                    {doc.indexed
                      ? <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Indexed
                        </span>
                      : <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                    }
                    {doc.chunksCount > 0 && (
                      <span className="text-xs text-slate-500">{doc.chunksCount} chunks</span>
                    )}
                    <button onClick={() => handleDelete(doc.id, doc.originalFilename)}
                      className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Quick Stats ───────────────────────────────────── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col animate-fade-in-right">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Quick Stats</h2>
              </div>
              <Link to="/admin/analytics"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Full analytics <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Total Users',    value: overview?.totalUsers ?? '—',                   color: 'text-indigo-400', bg: 'bg-indigo-500/5 border-indigo-500/15' },
                { label: 'Indexed Docs',   value: documents.filter(d=>d.indexed).length,          color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/15' },
                { label: 'Avg Confidence', value: avgConf,                                         color: 'text-amber-400',   bg: 'bg-amber-500/5 border-amber-500/15' },
                { label: 'Pending Index',  value: documents.filter(d=>!d.indexed).length,          color: 'text-rose-400',    bg: 'bg-rose-500/5 border-rose-500/15' },
              ].map(stat => (
                <div key={stat.label} className={`border rounded-xl p-4 ${stat.bg}`}>
                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{loading ? '…' : stat.value}</p>
                </div>
              ))}
            </div>

            {/* System status */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 mb-3">System Status</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Spring Boot API',    ok: true },
                  { label: 'PostgreSQL DB',      ok: true },
                  { label: 'AI Service (RAG)',   ok: true },
                  { label: 'FAISS Vector Index', ok: documents.some(d=>d.indexed) },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{s.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${s.ok ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                      <span className={`text-xs font-medium ${s.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.ok ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Query Logs Table ─────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Recent Query Logs</h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-md">Last 25</span>
            </div>
            <button onClick={loadAll} className="text-xs text-slate-500 hover:text-white transition-colors">↻ Refresh</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 text-slate-600 animate-spin" /></div>
          ) : queryLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No queries yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['User','Query','Response','Confidence','Language','Sentiment','Time'].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryLogs.map((log, i) => {
                    const conf = log.confidenceScore ?? 0;
                    const confColor = conf >= 0.8 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : conf >= 0.5 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                    const sent = SENTIMENT_BADGE[log.sentiment] || SENTIMENT_BADGE.NEUTRAL;
                    return (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors stagger-item">
                        <td className="py-3 pr-4">
                          <span className="text-xs font-mono text-slate-400">{log.userName || log.user || 'student'}</span>
                        </td>
                        <td className="py-3 pr-4 max-w-[180px]">
                          <p className="truncate text-xs text-white font-medium">{log.query || log.content}</p>
                        </td>
                        <td className="py-3 pr-4 max-w-[200px]">
                          <p className="truncate text-xs text-slate-400">{log.response || log.answer || '—'}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${confColor}`}>
                            {Math.round(conf * 100)}%
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                            {log.detectedLanguage === 'hi' ? '🇮🇳 Hindi'
                              : log.detectedLanguage === 'or' ? '🏛️ Odia' : '🇬🇧 English'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ color: sent.color, backgroundColor: sent.bg }}>
                            {sent.label}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-slate-500">{formatTime(log.timestamp)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
