import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { setAccessToken } from '../api/tokenStore';
import { API_URL } from '../api/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    // Au chargement de l'app, tente un rafraîchissement silencieux via le cookie
    // httpOnly (seul indice de session persistant — rien n'est stocké côté JS).
    (async () => {
      try {
        const res = await axios.post(
          `${API_URL}/auth/login/refresh/`,
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.access);
        await fetchMe();
      } catch {
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    setAccessToken(res.data.access);
    await fetchMe();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch {
      // même si l'appel échoue, on nettoie côté client
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
