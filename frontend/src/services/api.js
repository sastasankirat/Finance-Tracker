import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on login page and not during OAuth callback
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login' || currentPath === '/signup';
      const hasOAuthParam = window.location.search.includes('oauth=') || window.location.search.includes('error=');
      
      if (!isLoginPage && !hasOAuthParam) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
