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
  switchMockUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signInWithEmail: async () => ({}),
  signOut: async () => {},
  switchMockUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Troca rápida de usuário (para simular visões de Tiago, Ana ou CEO Diretoria)
  const switchMockUser = (userId: string) => {
    const found = USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem('nexus_current_user', JSON.stringify(found));
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('nexus_current_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
    setIsLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      // 1. Se o Supabase estiver configurado com credenciais reais
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || '123456',
        });
        if (error) {
          // Fallback para usuário de demonstração com mesmo e-mail se falhar
          const matched = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
            id: `usr_${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            role: email.includes('ceo') || email.includes('diretoria') || email.includes('admin') ? 'admin_ceo' : 'consultant',
            avatar: email.substring(0, 2).toUpperCase(),
            commissionRate: 10,
          };
          setUser(matched as AppUser);
          localStorage.setItem('nexus_current_user', JSON.stringify(matched));
        } else if (data.user) {
          const matched = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'Usuário',
            email: data.user.email || email,
            role: email.includes('ceo') || email.includes('diretoria') ? 'admin_ceo' : 'consultant',
            avatar: email.substring(0, 2).toUpperCase(),
            commissionRate: 10,
          };
          setUser(matched as AppUser);
          localStorage.setItem('nexus_current_user', JSON.stringify(matched));
        }
      } else {
        // Modo Simulação / Demo
        const matched = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          email: email,
          role: email.includes('ceo') || email.includes('diretoria') || email.includes('admin') ? 'admin_ceo' : 'consultant',
          avatar: email.substring(0, 2).toUpperCase(),
          commissionRate: 10,
        };
        setUser(matched as AppUser);
        localStorage.setItem('nexus_current_user', JSON.stringify(matched));
      }
      setIsLoading(false);
      return {};
    } catch (err: any) {
      setIsLoading(false);
      return { error: err.message || 'Erro ao realizar login.' };
    }
  };

  const signOut = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')) {
        await supabase.auth.signOut();
      }
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('nexus_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, profile: user, isLoading, signInWithEmail, signOut, switchMockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
