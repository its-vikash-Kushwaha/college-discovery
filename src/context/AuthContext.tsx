'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  savedIds: string[];
  toggleSave: (collegeId: string) => Promise<boolean>;
  refreshSaved: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const router = useRouter();

  // Load user session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user) {
            await fetchSavedIds();
          }
        }
      } catch (err) {
        console.error('Init auth error:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  async function fetchSavedIds() {
    try {
      const res = await fetch('/api/saved');
      if (res.ok) {
        const data = await res.json();
        setSavedIds(data.saved.map((c: any) => c.id));
      }
    } catch (err) {
      console.error('Fetch saved IDs error:', err);
    }
  }

  async function login(email: string, password: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        await fetchSavedIds();
        router.refresh();
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async function signup(name: string, email: string, password: string) {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        await fetchSavedIds();
        router.refresh();
        return { success: true };
      }
      return { success: false, error: data.error || 'Signup failed' };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async function logout() {
    try {
      const res = await fetch('/api/auth/me', { method: 'DELETE' });
      if (res.ok) {
        setUser(null);
        setSavedIds([]);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  async function toggleSave(collegeId: string) {
    if (!user) {
      router.push('/login');
      return false;
    }
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.saved) {
          setSavedIds((prev) => [...prev, collegeId]);
        } else {
          setSavedIds((prev) => prev.filter((id) => id !== collegeId));
        }
        return data.saved;
      }
    } catch (err) {
      console.error('Toggle save error:', err);
    }
    return false;
  }

  async function refreshSaved() {
    if (user) {
      await fetchSavedIds();
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, savedIds, toggleSave, refreshSaved }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
