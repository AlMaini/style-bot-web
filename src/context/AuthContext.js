import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = storage.getItem('access_token');
    const storedUser = storage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (accessToken, refreshToken, userInfo) => {
    storage.setItem('access_token', accessToken);
    storage.setItem('refresh_token', refreshToken);
    storage.setItem('user', JSON.stringify(userInfo));
    setToken(accessToken);
    setUser(userInfo);
  };

  const logout = () => {
    storage.removeItem('access_token');
    storage.removeItem('refresh_token');
    storage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
