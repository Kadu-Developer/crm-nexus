'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Check, X, Sparkles, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface ChangePasswordModalProps {
  isOpen: boolean;
  userEmail: string;
  userName: string;
  onPasswordChanged: (newPassword: string) => Promise<{ error?: string }>;
}

export function ChangePasswordModal({
  isOpen,
  userEmail,
  userName,
  onPasswordChanged,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Critérios de segurança
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const isPasswordValid = hasMinLength && hasNumber && hasUpper && hasLower && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('A nova senha não cumpre todos os requisitos de segurança.');
      return;
    }

    if (!passwordsMatch) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onPasswordChanged(newPassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Senha atualizada com sucesso! Bem-vindo ao CRM Nexus.');
      }
    } catch {
      toast.error('Erro ao atualizar senha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Primeiro Acesso: Troca de Senha
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Olá, <span className="font-bold text-slate-700 dark:text-slate-200">{userName || userEmail}</span>! Por motivos de segurança, você deve definir sua nova senha definitiva.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Nova Senha */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Nova Senha Definitiva *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white pr-10 focus:outline-none focus:border-blue-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Confirmar Nova Senha *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Digite novamente a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition font-mono ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-emerald-500 dark:border-emerald-500 focus:border-emerald-500'
                    : 'border-rose-500 dark:border-rose-500 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Checklist de Força da Senha */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px]">
            <span className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Requisitos de Segurança:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1 mr-0.5" />}
                <span>Mínimo 8 caracteres</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {hasUpper ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1 mr-0.5" />}
                <span>1 letra maiúscula</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {hasLower ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1 mr-0.5" />}
                <span>1 letra minúscula</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {hasNumber ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1 mr-0.5" />}
                <span>1 número</span>
              </div>

              <div className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1 mr-0.5" />}
                <span>1 caractere especial (!@#$%&*)</span>
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={!isPasswordValid || !passwordsMatch || isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Atualizando senha...' : 'Definir Senha e Entrar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
