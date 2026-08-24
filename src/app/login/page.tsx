'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/supabase/auth-context';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Activity, BrainCircuit, Cable } from 'lucide-react';
import { Toaster, toast } from 'sonner';

function LoginContent() {
  const { signInWithEmail, profile, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Se já está autenticado, vai direto para o painel
  useEffect(() => {
    if (!isLoading && profile) {
      router.replace('/');
    }
  }, [isLoading, profile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);

    if (res.error) {
      toast.error('Erro de autenticação', { description: res.error });
    } else {
      toast.success('Bem-vindo ao CRM Nexus!', { description: 'Sessão iniciada com sucesso.' });
      // AuthProvider's onAuthStateChange will handle redirect via router in AppContent
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900 dark:bg-[#10131b] dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5 items-stretch">
        <section className="hidden lg:flex min-h-[620px] flex-col justify-between rounded-2xl bg-[#052D72] p-10 text-white overflow-hidden relative">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#24C9FF]/25" />
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#24C9FF]/20" />
          <div>
            <div className="mt-24 max-w-md">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#24C9FF]">Nexus CRM</p>
              <h2 className="text-4xl font-black leading-tight tracking-tight">Dados em fluxo.<br />Decisões em movimento.</h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-blue-100">Uma visão única para transformar oportunidades em operações comerciais mais inteligentes.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-5">
            <div>
              <Activity className="mb-3 h-4 w-4 text-[#24C9FF]" />
              <p className="text-xs font-bold">Pipeline ativo</p>
              <p className="mt-1 text-[11px] text-blue-200">Visão em tempo real</p>
            </div>
            <div>
              <BrainCircuit className="mb-3 h-4 w-4 text-[#FF9A0B]" />
              <p className="text-xs font-bold">Decisão inteligente</p>
              <p className="mt-1 text-[11px] text-blue-200">Dados para agir</p>
            </div>
            <div>
              <Cable className="mb-3 h-4 w-4 text-[#24C9FF]" />
              <p className="text-xs font-bold">Fluxos conectados</p>
              <p className="mt-1 text-[11px] text-blue-200">Operação integrada</p>
            </div>
          </div>
        </section>

      <div className="w-full max-w-md lg:max-w-none relative z-10 space-y-5">
        {/* Card Principal */}
        <div className="bg-white dark:bg-[#171c27] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
          {/* Logo & Título */}
          <div className="text-center space-y-1.5">
            <Image src="/assets/logos/logo-shield-symbol.png" alt="Nexus Flow" width={72} height={78} className="mx-auto mb-2 h-[4.5rem] w-[4.25rem] object-contain" priority />
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">NEXUS CRM</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plataforma comercial consultiva B2B
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="exemplo@nexus.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F4510B] hover:bg-[#d94308] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4510B] focus-visible:ring-offset-2 text-white font-bold text-sm rounded-lg transition-colors active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Acessando...' : 'Entrar no Sistema'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Rodapé de Informação */}
          <p className="text-center text-[11px] text-slate-500">
            CRM Nexus &copy; 2026 &bull; Gestão Comercial Estratégica B2B
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}