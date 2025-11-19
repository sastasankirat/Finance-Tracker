import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for OAuth callback success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth') === 'success') {
      // OAuth callback successful - check auth status and clean up URL
      checkAuthStatus();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/status');
      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const loginWithOTP = async (email, otp) => {
    const response = await api.post('/auth/login-otp/verify', { email, otp });
    if (response.data.success) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const signup = async (email, password, name) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  };

  const verifyOTP = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  };

  const resendOTP = async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  };

  const requestLoginOTP = async (email) => {
    const response = await api.post('/auth/login-otp/request', { email });
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithOTP,
    signup,
    verifyOTP,
    resendOTP,
    requestLoginOTP,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
