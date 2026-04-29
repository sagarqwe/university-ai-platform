/**
 * File: frontend/src/App.jsx
 * Fixed: isAuthenticated and isAdmin are now booleans (not function calls)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './utils/theme';
import LoginPage        from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import AnalyticsPage    from './pages/AnalyticsPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated
          ? <Navigate to={isAdmin ? '/admin' : '/'} replace />
          : <LoginPage />}
      />
      <Route path="/"
        element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
      />
      <Route path="/admin"
        element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
      />
      <Route path="/admin/analytics"
        element={<ProtectedRoute adminOnly><AnalyticsPage /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? (isAdmin ? '/admin' : '/') : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b', color: '#f8fafc',
              border: '1px solid #334155', borderRadius: '10px', fontSize: '14px',
            },
          }} />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
