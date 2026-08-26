'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Mail, UserPlus, Zap } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: success
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [validatingInvite, setValidatingInvite] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Validate invitation token on mount and when token changes
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setInviteToken(token);
      validateInviteToken(token);
    }
  }, [searchParams]);

  const validateInviteToken = async (token: string) => {
    setValidatingInvite(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error) throw error;
      if (!data) {
        setError('Convite inválido ou não encontrado');
        setInviteToken(null);
        setInviteData(null);
        return;
      }
      if (data.status !== 'pending') {
        setError('Este convite não está mais disponível');
        setInviteToken(null);
        setInviteData(null);
        return;
      }
      if (new Date(data.expires_at) < new Date()) {
        setError('Este convite expirou');
        setInviteToken(null);
        setInviteData(null);
        return;
      }

      setInviteData(data);
      if (data.email) setEmail(data.email);
    } catch (err: any) {
      setError(err.message || 'Erro ao validar convite');
      setInviteToken(null);
      setInviteData(null);
    } finally {
      setValidatingInvite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // If we have an invitation, bypass domain check and use the invited email
      let finalEmail = email;
      let finalRole = 'consultant'; // default

      if (inviteData) {
        finalEmail = inviteData.email;
        finalRole = inviteData.role || 'consultant';
      } else {
        // Self-registration: check allowed domains
        const allowedDomains = ['nexusflowtech.com.br', 'nexus.com.br'];
        const emailDomain = email.split('@')[1];
        if (!allowedDomains.includes(emailDomain)) {
          setError('Apenas e-mails de domínios autorizados podem se registrar.');
          setLoading(false);
          return;
        }
      }

      // Create user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: finalEmail,
        password,
        options: {
          data: {
            name,
            role: finalRole,
            must_change_password: true,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // If we had an invitation, mark it as accepted
        if (inviteToken) {
          const { error: updateError } = await supabase
            .from('invitations')
            .update({
              status: 'accepted',
              used_at: new Date().toISOString(),
            })
            .eq('token', inviteToken);

          if (updateError) {
            console.error('Erro ao atualizar convite:', updateError);
            // We don't fail the registration if the invitation update fails
          }
        }

        // Send email verification (if needed)
        setStep(2);
      } else {
        setError('Erro ao criar conta. Por favor, tente novamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar conta');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="text-center space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Conta criada com sucesso!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-xl">
            Uma confirmação foi enviada para <span className="font-medium">{email}</span>.
            Por favor, verifique seu e-mail para completar o registro.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <ArrowLeft
            onClick={() => router.push('/login')}
            className="h-5 w-5 text-slate-500 hover:text-slate-700 cursor-pointer"
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Registro de Consultor
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 w-full">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm">
              <Mail className="h-4 w-4 mr-2 text-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                E-mail corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seunome@nexusflowtech.com.br"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha segura"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                required
                minLength={8}
              />
            </div>

            {inviteData && !validatingInvite && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
                <UserPlus className="h-4 w-4 mr-2 text-blue-500" />
                Convite válido para <strong>{inviteData.email}</strong>. Seu papel será: <strong>{inviteData.role || 'consultant'}</strong>.
              </div>
            )}

            {validatingInvite && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Validando convite...
              </div>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400">
              <Zap className="h-4 w-4 mr-1" />
              Após o registro, você terá acesso como consultor e poderá ver apenas:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Seus próprios leads e oportunidades</li>
                <li>Os calendários dos administradores (Carlos, Marcel e Patrik)</li>
                <li>Não será possível ver os calendários de outros consultores</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Registrar
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Já possui uma conta?{' '}
          <a
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Faça login aqui
          </a>
        </div>
      </div>
    </div>
  );
}