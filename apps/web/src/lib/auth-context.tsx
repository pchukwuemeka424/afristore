'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, clearTokens, getToken, setTokens } from './api';

type User = { email: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tok = getToken();
    if (!tok) {
      setLoading(false);
      return;
    }
    setUser({ email: 'merchant' });
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    setTokens(res.accessToken, res.refreshToken);
    setUser({ email });
  }, []);

  const register = useCallback(async (email: string, password: string, phone?: string) => {
    const res = await apiFetch<{ accessToken: string; refreshToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, phone }),
      auth: false,
    });
    setTokens(res.accessToken, res.refreshToken);
    setUser({ email });
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
