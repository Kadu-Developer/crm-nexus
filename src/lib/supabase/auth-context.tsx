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
  changePassword: (newPassword: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signInWithEmail: async () => ({}),
  changePassword: async () => ({}),
  signOut: async () => {},
});

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
      mustChangePassword: user.mustChangePassword,
      passwordChangedAt: user.passwordChangedAt,
    };
  }
  return undefined;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('seu-projeto');

  const isDemoMode = !supabaseConfigured || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Nexus@2026';
  const DEMO_USER_KEY = 'demoUser';

  useEffect(() => {
    if (isDemoMode) {
      const storedUserEmail = localStorage.getItem(DEMO_USER_KEY);
      if (storedUserEmail) {
        const mockUser = findMockUser(storedUserEmail);
        if (mockUser) {
          const changed = localStorage.getItem(`pw_changed_${mockUser.id}`);
          const effectiveUser = {
            ...mockUser,
            mustChangePassword: changed === 'true' ? false : (mockUser.mustChangePassword ?? false),
          };
          queueMicrotask(() => {
            setUser(effectiveUser);
            setProfile(effectiveUser);
          });
        }
      }
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    // Get session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const mustChange = session.user.user_metadata?.must_change_password ?? false;

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
                mustChangePassword: profileData.must_change_password ?? mustChange,
                passwordChangedAt: profileData.password_changed_at,
              };
              setUser(appUser);
              setProfile(appUser);
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const mustChange = session.user.user_metadata?.must_change_password ?? false;

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
              mustChangePassword: profileData.must_change_password ?? mustChange,
              passwordChangedAt: profileData.password_changed_at,
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

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signInWithEmail = async (email: string, password?: string) => {
    setIsLoading(true);

    if (isDemoMode) {
      if (password !== demoPassword) {
        setIsLoading(false);
        return { error: 'Senha inválida.' };
      }

      const mockUser = findMockUser(email);
      if (mockUser) {
        localStorage.setItem(DEMO_USER_KEY, email);
        const changed = localStorage.getItem(`pw_changed_${mockUser.id}`);
        const effectiveUser = {
          ...mockUser,
          mustChangePassword: changed === 'true' ? false : (mockUser.mustChangePassword ?? false),
        };
        setUser(effectiveUser);
        setProfile(effectiveUser);
        setIsLoading(false);
        return {};
      }
      setIsLoading(false);
      return { error: 'Usuário não encontrado.' };
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

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        setIsLoading(false);
        return { error: profileError?.message || 'Perfil do usuário não encontrado.' };
      }

      const mustChange = data.user.user_metadata?.must_change_password ?? profileData.must_change_password ?? false;

      const appUser: AppUser = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        avatar: profileData.avatar_url || profileData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        commissionRate: profileData.commission_rate || 10,
        mustChangePassword: mustChange,
        passwordChangedAt: profileData.password_changed_at,
      };
      setUser(appUser);
      setProfile(appUser);
      setIsLoading(false);
      return {};
    } catch (err) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Erro ao realizar login.';
      return { error: message };
    }
  };

  const changePassword = async (newPassword: string): Promise<{ error?: string }> => {
    if (isDemoMode && user) {
      localStorage.setItem(`pw_changed_${user.id}`, 'true');
      const updatedUser = { ...user, mustChangePassword: false, passwordChangedAt: new Date().toISOString() };
      setUser(updatedUser);
      setProfile(updatedUser);
      return {};
    }

    try {
      // 1. Atualiza a senha no Supabase Auth e desmarca a flag de primeiro login
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          must_change_password: false,
          password_changed_at: new Date().toISOString(),
        },
      });

      if (authError) {
        return { error: authError.message };
      }

      // 2. Atualiza a flag na tabela profiles
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({
            must_change_password: false,
            password_changed_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        const updatedUser = {
          ...user,
          mustChangePassword: false,
          passwordChangedAt: new Date().toISOString(),
        };
        setUser(updatedUser);
        setProfile(updatedUser);
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar a senha.';
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
    <AuthContext.Provider value={{ user, profile, isLoading, signInWithEmail, changePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
