import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api.js';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check a saved token

  const clear = useCallback(() => { localStorage.removeItem('taskflow_token'); setUser(null); }, []);

  // On first load: if a token exists, ask the server who we are
  useEffect(() => {
    const token = localStorage.getItem('taskflow_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(clear).finally(() => setLoading(false));
  }, [clear]);

  // Auto-logout when any request returns 401
  useEffect(() => {
    window.addEventListener('taskflow:unauthorized', clear);
    return () => window.removeEventListener('taskflow:unauthorized', clear);
  }, [clear]);

  const saveSession = ({ token, user }) => { localStorage.setItem('taskflow_token', token); setUser(user); };
  const login = async (email, password) => saveSession((await api.post('/auth/login', { email, password })).data);
  const register = async (name, email, password) => saveSession((await api.post('/auth/register', { name, email, password })).data);
  const logout = async () => { try { await api.post('/auth/logout'); } catch { /* ignore */ } clear(); };

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
