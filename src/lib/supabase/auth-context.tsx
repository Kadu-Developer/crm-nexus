'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User as AppUser } from '@/types/crm';
import { USERS } from '@/lib/mock-data';

interface AuthContextType {
  user: AppUser | null;
  profile: AppUser | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signInWithEmail: async () => ({}),
  signOut: async () => {},
});

// Mock user lookup for demo mode
const findMockUser = (email: string): AppUser | undefined => {
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      commissionRate: user.commissionRate,
    };
  }
  return undefined;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Demo mode: auto-login with mock user if using placeholder Supabase
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://seu-projeto.supabase.co';
  const DEMO_USER_KEY = 'demoUser';

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, check for persisted demo user in localStorage
      const storedUserEmail = localStorage.getItem(DEMO_USER_KEY);
      if (storedUserEmail) {
        const mockUser = findMockUser(storedUserEmail);
        if (mockUser) {
          setUser(mockUser);
          setProfile(mockUser);
        }
      }
      setIsLoading(false);
      return;
    }

    // Get session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch profile from database
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profileData, error }) => {
            if (!error && profileData) {
              const appUser: AppUser = {
                id: profileData.id,
                name: profileData.name,
                email: profileData.email,
                role: profileData.role,
                avatar: profileData.avatar_url || profileData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
                commissionRate: profileData.commission_rate || 10,
              };
              setUser(appUser);
              setProfile(appUser);
            }
          });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Fetch profile from database
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && profileData) {
            const appUser: AppUser = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role,
              avatar: profileData.avatar_url || profileData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
              commissionRate: profileData.commission_rate || 10,
            };
            setUser(appUser);
            setProfile(appUser);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password?: string) => {
    setIsLoading(true);

    if (isDemoMode) {
      // Demo mode: accept any email that matches mock users
      const mockUser = findMockUser(email);
      if (mockUser) {
        localStorage.setItem(DEMO_USER_KEY, email);
        setUser(mockUser);
        setProfile(mockUser);
        setIsLoading(false);
        return {};
      }
      setIsLoading(false);
      return { error: 'Usuário não encontrado no modo demo. Tente: tiago@nexus.com.br, ana@nexus.com.br ou diretoria@nexus.com.br' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      setIsLoading(false);
      return {};
    } catch (err) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Erro ao realizar login.';
      return { error: message };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
