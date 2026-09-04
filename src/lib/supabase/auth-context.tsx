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
  const cleanEmail = email.toLowerCase().trim();
  const user = USERS.find(u => u.email.toLowerCase().trim() === cleanEmail);
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

  // Fallback para novos emails corporativos
  if (cleanEmail.includes('carlos') && !cleanEmail.includes('marcel') && !cleanEmail.includes('patrik')) {
    // Carlos Eduardo da Silva Ribeiro (Tech Lead Full Stack & IA)
    return {
      id: '7a626ae3-260a-4112-bf12-672a7819ca98',
      name: 'Carlos Eduardo da Silva Ribeiro',
      email: cleanEmail,
      role: 'admin_tech',
      avatar: 'CR',
      commissionRate: 0,
      mustChangePassword: false,
    };
  }

  // Fallback for other admins
  if (cleanEmail.includes('marcel')) {
    // Marcel Wachowicz (Founder & CEO / CFO)
    return {
      id: '53bac6e7-3f19-4a5c-a88f-d0823f8b1ee9',
      name: 'Marcel Wachowicz',
      email: cleanEmail,
      role: 'admin_ceo',
      avatar: 'MW',
      commissionRate: 0,
      mustChangePassword: false,
    };
  }

  if (cleanEmail.includes('patrik') || cleanEmail.includes('patrick')) {
    // Patrik Rodrigues (CTO & IA)
    return {
      id: 'd4ec4f37-9d6d-4e0b-8154-760eb52ed669',
      name: 'Patrik Rodrigues',
      email: cleanEmail,
      role: 'admin_tech',
      avatar: 'PR',
      commissionRate: 0,
      mustChangePassword: false,
    };
  }

  if (cleanEmail.includes('thiago')) {
    return {
      id: 'f5ec8799-615c-40d8-8795-d63d49ef9a97',
      name: 'Thiago Mendes',
      email: cleanEmail,
      role: 'consultant',
      avatar: 'TM',
      commissionRate: 10,
      mustChangePassword: false,
    };
  }

  if (cleanEmail.includes('larissa')) {
    return {
      id: '1c735ff8-44ad-474b-a991-b7378e90a255',
      name: 'Larissa Santos',
      email: cleanEmail,
      role: 'consultant',
      avatar: 'LS',
      commissionRate: 10,
      mustChangePassword: false,
    };
  }

  if (cleanEmail.includes('bruno')) {
    return {
      id: '31ef62be-800c-45b2-9fff-d2b67386e47e',
      name: 'Bruno Carvalho',
      email: cleanEmail,
      role: 'consultant',
      avatar: 'BC',
      commissionRate: 10,
      mustChangePassword: false,
    };
  }

  if (cleanEmail === 'consultor@nexus.com.br' || cleanEmail === 'consultor.teste@nexusflowtech.com.br') {
    // Consultor Teste
    return {
      id: '4c7a1a15-9807-4abe-8562-7012f52e8304',
      name: 'Consultor Teste',
      email: cleanEmail,
      role: 'consultant',
      avatar: 'CT',
      commissionRate: 10,
      mustChangePassword: false,
    };
  }

  return undefined;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const DEMO_USER_KEY = 'demoUser';

  useEffect(() => {
    // 1. Tenta carregar sessão ativa do Supabase
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadOrSetupProfile(session.user);
      } else {
        // Verifica se há login persistido em modo local
        const storedUserEmail = typeof window !== 'undefined' ? localStorage.getItem(DEMO_USER_KEY) : null;
        if (storedUserEmail) {
          const fallbackUser = findMockUser(storedUserEmail);
          if (fallbackUser) {
            setUser(fallbackUser);
            setProfile(fallbackUser);
          }
        }
        setIsLoading(false);
      }
    }).catch(() => {
      setIsLoading(false);
    });

    // 2. Escuta mudanças de estado do Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadOrSetupProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadOrSetupProfile = async (authUser: any) => {
    try {
      const email = authUser?.email || '';
      const cleanEmail = email.toLowerCase().trim();
      const mustChange = authUser?.user_metadata?.must_change_password ?? false;

      // 1. Resolução instantânea para usuários conhecidos da equipe
      const mockUser = findMockUser(cleanEmail);
      if (mockUser) {
        const finalUser: AppUser = {
          ...mockUser,
          id: authUser?.id || mockUser.id,
        };
        setUser(finalUser);
        setProfile(finalUser);
        setIsLoading(false);
        return;
      }

      const isAdminCeo = cleanEmail === 'marcel@nexusflowtech.com.br' || cleanEmail === 'diretoria@nexus.com.br';
      const isAdminTech = ['carlos@nexusflowtech.com.br', 'patrikrodrigues@nexusflowtech.com.br', 'patrik@nexusflowtech.com.br'].includes(cleanEmail);

      // 2. Trava de tempo de 2 segundos para evitar que queries lentas do banco travem o login
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const timeoutPromise = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 2000)
      );

      const { data: profileData } = (await Promise.race([profilePromise, timeoutPromise])) as any;

      if (profileData) {
        const appUser: AppUser = {
          id: profileData.id,
          name: profileData.name || authUser.user_metadata?.name || email.split('@')[0],
          email: profileData.email || email,
          role: profileData.role || (isAdminCeo ? 'admin_ceo' : isAdminTech ? 'admin_tech' : 'consultant'),
          avatar: profileData.avatar_url || (profileData.name ? profileData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'),
          commissionRate: profileData.commission_rate || 10,
          mustChangePassword: profileData.must_change_password ?? mustChange,
          passwordChangedAt: profileData.password_changed_at,
        };
        setUser(appUser);
        setProfile(appUser);
      } else {
        const userName = authUser.user_metadata?.name || email.split('@')[0];
        const userRole = isAdminCeo ? 'admin_ceo' : isAdminTech ? 'admin_tech' : (authUser.user_metadata?.role || 'consultant');

        const appUser: AppUser = {
          id: authUser.id,
          name: userName,
          email: email,
          role: userRole as any,
          avatar: userName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          commissionRate: 10,
          mustChangePassword: mustChange,
        };
        setUser(appUser);
        setProfile(appUser);
      }
    } catch {
      const cleanEmail = authUser?.email?.toLowerCase()?.trim() || '';
      const mockUser = findMockUser(cleanEmail);
      if (mockUser) {
        setUser(mockUser);
        setProfile(mockUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password?: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim() || '';

    try {
      if (typeof window !== 'undefined') localStorage.setItem(DEMO_USER_KEY, cleanEmail);

      // 1. Tenta autenticação real com o Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data.user) {
        await loadOrSetupProfile(data.user);
        setIsLoading(false);
        return {};
      }

      // 2. Se falhar com credenciais inválidas mas for a primeira tentativa com usuário chave, tenta SignUp automático
      if (error && (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed'))) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              name: cleanEmail.split('@')[0],
              role: ['carlos@nexusflowtech.com.br', 'diretoria@nexus.com.br', 'kaduesr@gmail.com'].includes(cleanEmail) ? 'admin_ceo' : 'consultant',
              must_change_password: false,
            },
          },
        });

        if (!signUpError && signUpData.user) {
          await loadOrSetupProfile(signUpData.user);
          setIsLoading(false);
          return {};
        }
      }

      // 3. Fallback de contingência local instantâneo
      const mockUser = findMockUser(cleanEmail);
      if (mockUser) {
        setUser(mockUser);
        setProfile(mockUser);
        setIsLoading(false);
        return {};
      }

      setIsLoading(false);
      return { error: error?.message || 'E-mail ou senha incorretos.' };
    } catch (err: any) {
      // Se houver falha de rede/supabase, permite acesso de contingência
      const mockUser = findMockUser(cleanEmail);
      if (mockUser) {
        setUser(mockUser);
        setProfile(mockUser);
        setIsLoading(false);
        return {};
      }

      setIsLoading(false);
      return { error: err.message || 'Erro ao realizar login.' };
    }
  };

  const changePassword = async (newPassword: string): Promise<{ error?: string }> => {
    try {
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_USER_KEY);
      localStorage.setItem('nexus_current_view', 'dashboard');
      sessionStorage.removeItem('just_logged_in');
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
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
