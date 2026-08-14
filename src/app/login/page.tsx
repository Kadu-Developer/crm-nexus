'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/mock-data';
import { ThemeProvider } from '@/lib/theme-provider';
import { Flame, Shield, Lock, Mail, ArrowRight, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { Toaster, toast } from 'sonner';

function LoginContent() {
  const { signInWithEmail, switchMockUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);

    if (res.error) {
      toast.error('Erro de autenticação', { description: res.error });
    } else {
      toast.success('Bem-vindo ao CRM Nexus!', { description: 'Sessão iniciada com sucesso.' });
      router.push('/');
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchMockUser(userId);
    toast.success('Login efetuado com sucesso!');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* Luz de Fundo Tecnológica */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Card Principal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Logo & Título */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/30 mb-2">
              N
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">NEXUS CRM</h1>
            <p className="text-xs text-slate-400">
              Plataforma Comercial Consultiva B2B
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="exemplo@nexus.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Acessando...' : 'Entrar no Sistema'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divisor */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Ou selecione um perfil para testar
            </span>
          </div>

          {/* Perfis Rápidos de Demonstração */}
          <div className="space-y-2">
            {/* CEO / Administrador */}
            <button
              type="button"
              onClick={() => handleQuickLogin('usr_ceo')}
              className="w-full p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-xl flex items-center justify-between transition group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black flex items-center justify-center text-xs">
                  👑
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-200 group-hover:text-white block">
                    Diretoria Executiva (CEO / Admin)
                  </span>
                  <span className="text-[11px] text-amber-400/80">
                    Visão Global 360° de todo o pipeline e metas
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
            </button>

            {/* Funcionário / Consultor Tiago */}
            <button
              type="button"
              onClick={() => handleQuickLogin('usr_tiago')}
              className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl flex items-center justify-between transition group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center text-xs">
                  TS
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-200 group-hover:text-white block">
                    Tiago Santos (Consultor Comercial)
                  </span>
                  <span className="text-[11px] text-blue-400/80">
                    Visão do consultor (Seus leads e comissões)
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition" />
            </button>

            {/* Funcionária / Consultora Ana */}
            <button
              type="button"
              onClick={() => handleQuickLogin('usr_ana')}
              className="w-full p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl flex items-center justify-between transition group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                  AR
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-200 group-hover:text-white block">
                    Ana Ribeiro (Consultora Comercial)
                  </span>
                  <span className="text-[11px] text-indigo-400/80">
                    Visão da consultora (Seus leads e comissões)
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Rodapé de Informação */}
        <p className="text-center text-[11px] text-slate-500">
          CRM Nexus &copy; 2026 &bull; Gestão Comercial Estratégica B2B
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  );
}
