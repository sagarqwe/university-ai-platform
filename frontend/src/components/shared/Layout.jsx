/**
 * File: frontend/src/components/shared/Layout.jsx
 * Purpose: App shell with NIST logo, theme toggle, sidebar + topbar.
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, themes } from '../../utils/theme';
import toast from 'react-hot-toast';
import {
  MessageSquare, LayoutDashboard, BarChart2,
  LogOut, Shield, ChevronRight, Sun, Moon
} from 'lucide-react';
import NIST_LOGO from '../../utils/logo';

const studentNav = [{ label: 'Chat',      icon: MessageSquare,   path: '/' }];
const adminNav   = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Analytics', icon: BarChart2,        path: '/admin/analytics' },
];

export default function Layout({ children, title }) {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle }          = useTheme();
  const location                  = useLocation();
  const navigate                  = useNavigate();
  const nav                       = isAdmin ? adminNav : studentNav;
  const t                         = dark ? themes.dark : themes.light;

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: t.bg }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col animate-fade-in-left"
             style={{ backgroundColor: t.sidebar, borderRight: `1px solid ${dark ? '#1e2e1e' : '#2a2a2a'}` }}>

        {/* Logo area */}
        <div className="p-5" style={{ borderBottom: `1px solid ${dark ? '#1e2e1e' : '#2a2a2a'}` }}>
          <div className="flex items-center gap-3">
            <img src={NIST_LOGO} alt="NIST" className="w-10 h-10 rounded-xl object-cover shadow-md flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-none truncate">NIST University</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: t.green }}>Helpdesk Platform</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-3" style={{ color: '#555' }}>
            {isAdmin ? 'Admin Panel' : 'Student Portal'}
          </p>
          {nav.map(({ label, icon: Icon, path }, idx) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all stagger-item"
              style={isActive(path)
                ? { backgroundColor: t.green, color: '#fff' }
                : { color: '#9ca3af' }
              }
              onMouseEnter={e => { if (!isActive(path)) e.currentTarget.style.backgroundColor = dark ? '#1e2e1e' : '#2a2a2a'; }}
              onMouseLeave={e => { if (!isActive(path)) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive(path) && <ChevronRight className="w-3 h-3 opacity-70" />}
            </Link>
          ))}

          {isAdmin && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${dark ? '#1e2e1e' : '#2a2a2a'}` }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                   style={{ backgroundColor: `${t.green}18`, border: `1px solid ${t.green}35` }}>
                <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.green }} />
                <span className="text-xs font-semibold" style={{ color: t.green }}>Admin Access</span>
              </div>
            </div>
          )}
        </nav>

        {/* User + logout */}
        <div className="p-3" style={{ borderTop: `1px solid ${dark ? '#1e2e1e' : '#2a2a2a'}` }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                 style={{ backgroundColor: t.green }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: '#6b7280' }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} title="Sign out"
              className="p-1.5 rounded-lg transition-all flex-shrink-0"
              style={{ color: '#6b7280' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ff444420'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 flex-shrink-0 animate-fade-in-down"
                style={{ backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          {/* Left — page title */}
          <div className="flex items-center gap-3">
            <img src={NIST_LOGO} alt="NIST" className="w-7 h-7 rounded-lg object-cover" />
            <div>
              <h1 className="text-sm font-bold leading-none" style={{ color: t.text }}>{title}</h1>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>NIST University Helpdesk</p>
            </div>
          </div>

          {/* Right — controls */}
          <div className="flex items-center gap-2">

            {/* Online dot */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{ backgroundColor: t.greenBg, border: `1px solid ${t.green}44` }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: t.green }} />
              <span className="text-xs font-medium" style={{ color: t.greenDark }}>Online</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.textMuted }}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark
                ? <Sun  className="w-4 h-4" style={{ color: t.green }} />
                : <Moon className="w-4 h-4" />
              }
            </button>

            {/* User chip */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                   style={{ backgroundColor: t.green }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-xs font-semibold" style={{ color: t.text }}>{user?.name}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ backgroundColor: '#fff0f0', color: '#e53935', border: '1px solid #ffcdd2' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffebee'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff0f0'}
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 page-enter" style={{ backgroundColor: t.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
}
