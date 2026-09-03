import axios from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // envoie le cookie httpOnly (refresh token) au backend
});

// Ajoute automatiquement l'access token (en mémoire) à chaque requête
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rafraîchit l'access token automatiquement si expiré (401), via le cookie httpOnly
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          'http://localhost:8000/api/auth/login/refresh/',
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
