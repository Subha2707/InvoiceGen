import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    checkAuth();
  }, []);

  const fetchMe = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.data);
    return data.data;
  };

  const checkAuth = async () => {
    try {
      if (!localStorage.getItem('accessToken')) {
        setLoading(false);
        return;
      }
      // Proactively refresh so we never flash a 401 for a stale access token.
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      localStorage.setItem('accessToken', data.data.accessToken);
      await fetchMe();
    } catch (error) {
      localStorage.removeItem('accessToken');
      if (error?.response?.status !== 401) {
        console.error('Auth check failed:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const oauthComplete = async (token) => {
    localStorage.setItem('accessToken', token);
    try {
      await fetchMe();
      return true;
    } catch (error) {
      localStorage.removeItem('accessToken');
      throw error;
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data;
  };

  const googleLogin = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, oauthComplete, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
