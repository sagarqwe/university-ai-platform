/**
 * File: frontend/src/services/api.js
 * Purpose: Axios instance + all API calls.
 */
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth API ─────────────────────────────────────────────
export const authAPI = {
  login:   (email, password)            => api.post('/auth/login',        { email, password }),
  register:(name, email, password, role)=> api.post('/auth/register',     { name, email, password, role }),
  setupProfile: (data, token) => {
    const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post('/auth/profile-setup', data, cfg);
  },
  me:      ()                           => api.get('/auth/me'),
  logout:  ()                           => api.post('/auth/logout'),
};

// ── Chat API ─────────────────────────────────────────────
export const chatAPI = {
  query: (query, language = 'auto', sessionId = null, profile = {}) =>
    api.post('/chat/query', { query, language, sessionId, ...profile }),
  createSession: () => api.post('/chat/session'),
  getSessions:   () => api.get('/chat/sessions'),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
};

// ── Admin API ─────────────────────────────────────────────
export const adminAPI = {
  getDocuments:    ()        => api.get('/admin/documents'),
  uploadDocument:  (fd)      => api.post('/admin/documents/upload', fd,
                                { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocument:  (id)      => api.delete(`/admin/documents/${id}`),
  reindex:         ()        => api.post('/admin/documents/reindex'),
  getOverview:     ()        => api.get('/admin/analytics/overview'),
  getQueriesPerDay:()        => api.get('/admin/analytics/queries-per-day'),
  getLanguageDist: ()        => api.get('/admin/analytics/language-distribution'),
  getConfidenceTrend:()      => api.get('/admin/analytics/confidence-trend'),
  getQueryLogs:    (limit=50)=> api.get(`/admin/analytics/query-logs?limit=${limit}`),
  getHealth:       ()        => api.get('/admin/health'),
};

// ── Feedback API ──────────────────────────────────────────
export const feedbackAPI = {
  submit:  (data) => api.post('/feedback', data),
  summary: ()     => api.get('/feedback/summary'),
};
