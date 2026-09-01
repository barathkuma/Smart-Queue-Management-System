import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage and verify with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const { token: savedToken, user: savedUser } = authService.getStoredAuth();
      if (savedToken) {
        setToken(savedToken);
        setUser(savedUser);
        try {
          // Verify & sync latest profile from backend
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch {
          // If token invalid, local auth cleared by interceptor
          console.warn('Session expired or invalid, reset local auth state.');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.tokens.access);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      setToken(data.tokens.access);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      return freshUser;
    } catch {
      return null;
    }
  };

  const getDashboardPath = (customRole) => {
    const currentRole = customRole || user?.role;
    switch (currentRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STAFF':
        return '/staff/dashboard';
      case 'USER':
      default:
        return '/dashboard';
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    getDashboardPath,
    isAdmin: user?.role === 'ADMIN',
    isStaff: user?.role === 'STAFF',
    isUser: user?.role === 'USER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
