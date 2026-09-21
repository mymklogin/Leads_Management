import axios from 'axios';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return `http://${hostname}:5108/api`;
    }
  }
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-inject JWT token & User ID into every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lead_mgmt_token');
  const user = localStorage.getItem('lead_mgmt_user');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed?.id) {
        config.headers['X-User-Id'] = parsed.id.toString();
      }
    } catch (e) {
      // ignore
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auto-handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('lead_mgmt_token');
      // localStorage.removeItem('lead_mgmt_user');
    }
    return Promise.reject(error);
  }
);

export default api;
