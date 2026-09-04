'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/supabase/auth-context';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Activity, BrainCircuit, Cable, Sparkles, UserCheck, Eye, EyeOff } from 'lucide-react';
import { Toaster, toast } from 'sonner';

function LoginContent() {
  const { signInWithEmail, profile, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Se já está autenticado, vai direto para o painel
  useEffect(() => {
    if (!isLoading && profile) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, [isLoading, profile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);

    if (res.error) {
      toast.error('Erro de autenticação', { description: res.error });
    } else {
      toast.success('Bem-vindo ao CRM Nexus!', { description: 'Sessão iniciada com sucesso.' });
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const handleQuickFill = (presetEmail: string, presetPass: string = 'Nexus@2026') => {
    setEmail(presetEmail);
    setPassword(presetPass);
    toast.info(`Credenciais de ${presetEmail} preenchidas. Clique em "Entrar no Sistema".`);
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
                    placeholder="carlos@nexusflowtech.com.br"
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer p-1"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#F4510B] hover:bg-[#d94308] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4510B] focus-visible:ring-offset-2 text-white font-bold text-sm rounded-lg transition-colors active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
              >
                {loading ? 'Acessando...' : 'Entrar no Sistema'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Acesso Rápido de Demonstração */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block text-center">
                Acessos Rápidos para Testes (Clique para preencher):
              </span>

              {/* Seção Superiores / Visão Administrativa */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                  Visão Administrativa (CEO / Admin)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('marcel@nexusflowtech.com.br', 'Nexus@2026')}
                    className="p-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/30 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-left transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-xs">Marcel Wachowicz</p>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">CEO</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Founder & CEO / CFO</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('carlos@nexusflowtech.com.br', 'Nexus@2026')}
                    className="p-2 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/30 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-left transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-xs">Carlos Eduardo</p>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold">Admin Tech</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Tech Lead & Engenharia</p>
                  </button>
                </div>
              </div>

              {/* Seção Consultores / Visão Individual */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">
                  Visão dos Consultores (Equipe Comercial)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('thiago.consultor@nexusflowtech.com.br', 'Nexus@2026')}
                    className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/30 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-left transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-xs">Thiago Mendes</p>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">2 Leads</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Consultor Sênior</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('larissa.consultora@nexusflowtech.com.br', 'Nexus@2026')}
                    className="p-2 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/30 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-left transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-xs">Larissa Santos</p>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">1 Lead</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Consultora Negócios</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('bruno.consultor@nexusflowtech.com.br', 'Nexus@2026')}
                    className="p-2 rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/30 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-left transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-xs">Bruno Carvalho</p>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold">1 Lead</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Consultor Estruturação</p>
                  </button>
                </div>
              </div>
            </div>

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