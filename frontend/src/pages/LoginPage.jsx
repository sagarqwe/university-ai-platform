/**
 * File: frontend/src/pages/LoginPage.jsx
 * Features: Sign In, Sign Up, Profile Setup, Role toggle, Theme toggle
 * Layout: Dark left branding panel (always visible) + white right form panel
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme, themes } from '../utils/theme';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Lock, Mail, Loader2, BookOpen, Users, Zap,
  Sun, Moon, User, Eye, EyeOff, ChevronRight, ArrowLeft
} from 'lucide-react';
import NIST_LOGO from '../utils/logo';

const BRANCHES = ['CSE','ECE','EEE','ME','CE','IT','MCA','MBA'];
const COURSES  = ['B.Tech','M.Tech','MCA','MBA','B.Sc','M.Sc'];

export default function LoginPage() {
  const [mode,        setMode]       = useState('signin');
  const [role,        setRole]       = useState('STUDENT');
  const [showPass,    setShowPass]   = useState(false);
  const [loading,     setLoading]    = useState(false);
  const [token,       setToken]      = useState(null);

  const [email,       setEmail]      = useState('');
  const [password,    setPassword]   = useState('');
  const [name,        setName]       = useState('');
  const [confirmPass, setConfirm]    = useState('');
  const [branch,      setBranch]     = useState('');
  const [year,        setYear]       = useState('');
  const [course,      setCourse]     = useState('');
  const [hostel,      setHostel]     = useState(false);

  const { login, loginWithToken } = useAuth();
  const { dark, toggle }          = useTheme();
  const navigate                  = useNavigate();
  const t                         = dark ? themes.dark : themes.light;

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (!user.profileComplete && user.role === 'STUDENT') {
        setMode('profile');
      } else {
        navigate(user.role === 'ADMIN' ? '/admin' : '/');
      }
    } catch {
      toast.error('Invalid email or password');
    } finally { setLoading(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPass) { toast.error('Fill in all fields'); return; }
    if (password !== confirmPass) { toast.error('Passwords do not match'); return; }
    if (password.length < 6)     { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register(name, email, password, role);
      setToken(res.data.token);
      toast.success('Account created!');
      if (role === 'STUDENT') { setMode('profile'); }
      else { await loginWithToken(res.data); navigate('/admin'); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    if (!branch || !year || !course) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await authAPI.setupProfile({ branch, year: parseInt(year), course, hostel }, token);
      await loginWithToken(res.data);
      toast.success('Profile complete! Welcome 🎉');
      navigate('/');
    } catch {
      toast.error('Profile setup failed');
    } finally { setLoading(false); }
  };

  const fillDemo = (r) => {
    if (r === 'admin') { setEmail('admin@university.edu'); setPassword('admin123'); setRole('ADMIN'); }
    else               { setEmail('student@university.edu'); setPassword('student123'); setRole('STUDENT'); }
    setMode('signin');
  };

  const inp = {
    backgroundColor: t.inputBg,
    border: `1.5px solid ${t.inputBorder}`,
    color: t.text,
    borderRadius: 10,
    padding: '11px 12px 11px 38px',
    width: '100%',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };
  const lbl = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: t.text,
  };
  const focusBorder = (e) => { e.target.style.borderColor = '#7bc67e'; };
  const blurBorder  = (e) => { e.target.style.borderColor = t.inputBorder; };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      backgroundColor: t.bg,
    }}>

      {/* ── LEFT DARK BRANDING PANEL ─────────────────────────────── */}
      <div style={{
        width: '42%',
        minWidth: 340,
        backgroundColor: '#0d1a0f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Background glow blobs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,198,126,0.15), transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,198,126,0.10), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Top — logo + university name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
          <img src={NIST_LOGO} alt="NIST"
            style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }} />
          <div>
            <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>NIST University</p>
            <p style={{ color: '#7bc67e', fontSize: 12, marginTop: 2 }}>Berhampur, Odisha</p>
          </div>
        </div>

        {/* Middle — headline + description + features */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            <span style={{ color: '#ffffff' }}>University</span><br />
            <span style={{ color: '#7bc67e' }}>AI Helpdesk</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
            Ask questions about admissions, fees, exams,<br />
            hostels and more — in English, Hindi or Odia.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: BookOpen, text: 'Answers from official documents' },
              { icon: Users,    text: 'English · Hindi · Odia support' },
              { icon: Zap,      text: 'Hallucination-safe AI pipeline' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  backgroundColor: 'rgba(123,198,126,0.12)',
                  border: '1px solid rgba(123,198,126,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: 15, height: 15, color: '#7bc67e' }} />
                </div>
                <span style={{ color: '#d1d5db', fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — copyright */}
        <p style={{ color: '#374151', fontSize: 12, position: 'relative', zIndex: 1 }}>
          © 2026 NIST University · Powered by RAG AI
        </p>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        backgroundColor: t.bg,
        position: 'relative',
        overflowY: 'auto',
      }}>

        {/* Theme toggle */}
        <button onClick={toggle} style={{
          position: 'absolute', top: 24, right: 24,
          width: 40, height: 40, borderRadius: '50%',
          border: `1px solid ${t.border}`, backgroundColor: t.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          {dark
            ? <Sun  style={{ width: 16, height: 16, color: '#7bc67e' }} />
            : <Moon style={{ width: 16, height: 16, color: t.textMuted }} />}
        </button>

        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* ── SIGN IN ──────────────────────────────────────────── */}
          {mode === 'signin' && (<>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>
              Welcome Back 👋
            </h2>
            <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 28 }}>
              Sign in to NIST University Helpdesk
            </p>

            {/* Role toggle */}
            <div style={{
              display: 'flex', gap: 6, padding: 5, borderRadius: 12,
              backgroundColor: t.card, border: `1px solid ${t.border}`, marginBottom: 24,
            }}>
              {['STUDENT','ADMIN'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: role === r ? '#7bc67e' : 'transparent',
                  color: role === r ? '#fff' : t.textMuted,
                }}>
                  {r === 'STUDENT' ? '🎓 Student' : '🛡️ Admin'}
                </button>
              ))}
            </div>

            {/* Form card */}
            <div style={{
              backgroundColor: t.card, border: `1px solid ${t.border}`,
              borderRadius: 16, padding: 32, marginBottom: 16,
            }}>
              <form onSubmit={handleSignIn}>
                {/* Email */}
                <div style={{ marginBottom: 18 }}>
                  <label style={lbl}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color: t.textMuted }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@nist.edu" style={inp}
                      onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 24 }}>
                  <label style={lbl}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color: t.textMuted }} />
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      style={{ ...inp, paddingRight: 40 }}
                      onFocus={focusBorder} onBlur={blurBorder} />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{
                      position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color: t.textMuted,
                    }}>
                      {showPass ? <EyeOff style={{ width:15, height:15 }} /> : <Eye style={{ width:15, height:15 }} />}
                    </button>
                  </div>
                </div>

                {/* Sign In button */}
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                  backgroundColor: loading ? '#a0d4a3' : '#7bc67e',
                  color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background-color 0.2s',
                }}>
                  {loading
                    ? <><Loader2 style={{ width:16, height:16, animation:'spin 1s linear infinite' }} /> Signing in...</>
                    : 'Sign In →'}
                </button>
              </form>

              {/* Demo buttons */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${t.border}` }}>
                <p style={{ textAlign:'center', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:1, color: t.textMuted, marginBottom:10 }}>
                  Quick Demo Access
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[{r:'admin',l:'🛡️ Admin Demo'},{r:'student',l:'🎓 Student Demo'}].map(({r,l}) => (
                    <button key={r} onClick={() => fillDemo(r)} style={{
                      padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      backgroundColor: 'rgba(123,198,126,0.08)',
                      border: '1px solid rgba(123,198,126,0.25)',
                      color: '#7bc67e', cursor: 'pointer',
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ textAlign:'center', fontSize:14, color: t.textMuted }}>
              New student?{' '}
              <button onClick={() => setMode('signup')} style={{
                background:'none', border:'none', color:'#7bc67e',
                fontWeight:600, cursor:'pointer', fontSize:14,
              }}>Create account</button>
            </p>

            <p style={{ textAlign:'center', fontSize:12, color: t.textMuted, marginTop:24 }}>
              NIST University Helpdesk · Berhampur, Odisha · RAG-Powered AI
            </p>
          </>)}

          {/* ── SIGN UP ──────────────────────────────────────────── */}
          {mode === 'signup' && (<>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              <button onClick={() => setMode('signin')} style={{
                width:36, height:36, borderRadius:10, border:`1px solid ${t.border}`,
                backgroundColor:t.card, cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center', color: t.textMuted,
              }}>
                <ArrowLeft style={{ width:15, height:15 }} />
              </button>
              <div>
                <h2 style={{ fontSize:24, fontWeight:800, color:t.text }}>Create Account</h2>
                <p style={{ fontSize:13, color:t.textMuted }}>Join NIST University Helpdesk</p>
              </div>
            </div>

            <div style={{ backgroundColor:t.card, border:`1px solid ${t.border}`, borderRadius:16, padding:28 }}>
              <form onSubmit={handleSignUp}>
                <div style={{ marginBottom:16 }}>
                  <label style={lbl}>Full Name</label>
                  <div style={{ position:'relative' }}>
                    <User style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:t.textMuted }} />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your full name" style={inp} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={lbl}>Email</label>
                  <div style={{ position:'relative' }}>
                    <Mail style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:t.textMuted }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@nist.edu" style={inp} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                  <div>
                    <label style={lbl}>Password</label>
                    <div style={{ position:'relative' }}>
                      <Lock style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:t.textMuted }} />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••" style={inp} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Confirm</label>
                    <div style={{ position:'relative' }}>
                      <Lock style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:t.textMuted }} />
                      <input type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)}
                        placeholder="••••••" style={inp} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={lbl}>Role</label>
                  <div style={{ display:'flex', gap:6, padding:4, borderRadius:10, backgroundColor:t.bg }}>
                    {['STUDENT','ADMIN'].map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)} style={{
                        flex:1, padding:'8px 0', borderRadius:8, fontSize:13, fontWeight:600,
                        border:'none', cursor:'pointer', transition:'all 0.2s',
                        backgroundColor: role === r ? '#7bc67e' : 'transparent',
                        color: role === r ? '#fff' : t.textMuted,
                      }}>
                        {r === 'STUDENT' ? '🎓 Student' : '🛡️ Admin'}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{
                  width:'100%', padding:'12px 0', borderRadius:10, border:'none',
                  backgroundColor: loading ? '#a0d4a3' : '#7bc67e',
                  color:'#fff', fontWeight:700, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  {loading ? <><Loader2 style={{ width:16, height:16 }} /> Creating...</> : 'Create Account →'}
                </button>
              </form>
            </div>
          </>)}

          {/* ── PROFILE SETUP ─────────────────────────────────────── */}
          {mode === 'profile' && (<>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              <div style={{
                width:36, height:36, borderRadius:10, backgroundColor:'#7bc67e',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontWeight:700, fontSize:16, flexShrink:0,
              }}>1</div>
              <div>
                <h2 style={{ fontSize:22, fontWeight:800, color:t.text }}>Complete Your Profile</h2>
                <p style={{ fontSize:13, color:t.textMuted }}>Personalise your NIST experience</p>
              </div>
            </div>

            <div style={{ backgroundColor:t.card, border:`1px solid ${t.border}`, borderRadius:16, padding:28 }}>
              <form onSubmit={handleProfile}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                  <div>
                    <label style={lbl}>Branch</label>
                    <select value={branch} onChange={e => setBranch(e.target.value)}
                      style={{ ...inp, paddingLeft:12, appearance:'none' }}
                      onFocus={focusBorder} onBlur={blurBorder}>
                      <option value="">Select branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Year</label>
                    <select value={year} onChange={e => setYear(e.target.value)}
                      style={{ ...inp, paddingLeft:12, appearance:'none' }}
                      onFocus={focusBorder} onBlur={blurBorder}>
                      <option value="">Select year</option>
                      {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={lbl}>Course</label>
                  <select value={course} onChange={e => setCourse(e.target.value)}
                    style={{ ...inp, paddingLeft:12, appearance:'none' }}
                    onFocus={focusBorder} onBlur={blurBorder}>
                    <option value="">Select course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={lbl}>Hostel Resident?</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[{v:true,l:'✅ Yes, hostel'},{v:false,l:'🏠 Day scholar'}].map(({v,l}) => (
                      <button key={String(v)} type="button" onClick={() => setHostel(v)} style={{
                        flex:1, padding:'10px 0', borderRadius:10, fontSize:13, fontWeight:600,
                        cursor:'pointer', border: hostel === v ? 'none' : `1px solid ${t.inputBorder}`,
                        backgroundColor: hostel === v ? '#7bc67e' : t.inputBg,
                        color: hostel === v ? '#fff' : t.textMuted,
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{
                  width:'100%', padding:'12px 0', borderRadius:10, border:'none',
                  backgroundColor: loading ? '#a0d4a3' : '#7bc67e',
                  color:'#fff', fontWeight:700, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  {loading
                    ? <><Loader2 style={{ width:16, height:16 }} /> Saving...</>
                    : <><ChevronRight style={{ width:16, height:16 }} /> Complete Setup</>}
                </button>
              </form>
            </div>
          </>)}

        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #9ca3af; }
        select option { background: #1c2420; color: #fff; }
        @media (max-width: 700px) {
          .left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
