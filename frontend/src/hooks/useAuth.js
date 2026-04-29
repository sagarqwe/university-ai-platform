/**
 * File: frontend/src/hooks/useAuth.js
 * Fixed: isAuthenticated and isAdmin are now boolean values, not functions
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const saved = localStorage.getItem('user_data');
    if (token && saved) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
      }
    }
    setReady(true);
  }, []);

  const _saveSession = (data) => {
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user_data', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    return _saveSession(res.data);
  };

  const loginWithToken = async (data) => _saveSession(data);

  const logout = async () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Boolean values — NOT functions
  const isAuthenticated = !!user;
  const isAdmin         = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, loginWithToken, logout, isAuthenticated, isAdmin, ready }}>
      {ready ? children : null}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
