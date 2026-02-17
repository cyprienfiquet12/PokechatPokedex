'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AppUser {
  id: number;
  username: string;
  display_name?: string;
  xp: number;
  level: number;
  poke_coins: number;
}

interface AuthContextValue {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithTwitch: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAppUser = useCallback(async () => {
    const res = await fetch('/api/sync-user');
    if (res.ok) {
      const data = await res.json();
      setAppUser(data.appUser);
    } else {
      setAppUser(null);
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAppUser();
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAppUser().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchAppUser]);

  const signInWithTwitch = useCallback(async () => {
    const base =
      (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) ||
      (typeof window !== 'undefined' && window.location.origin) ||
      '';
    const redirectTo = `${base.replace(/\/$/, '')}/auth/callback?next=/equipe`;
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo,
        scopes: 'user:read:email',
      },
    });
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAppUser(null);
  }, [supabase.auth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        loading,
        signInWithTwitch,
        signOut,
        refreshAppUser: fetchAppUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
