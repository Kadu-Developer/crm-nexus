'use client';

import React, { useState } from 'react';
import { CollaboratorAccount, Department } from '@/types/calendar';
import { X, UserPlus, Mail, Shield, Check, Sparkles, LogIn } from 'lucide-react';
import { toast } from 'sonner';

interface AddCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (collaborator: Omit<CollaboratorAccount, 'id' | 'syncStatus' | 'lastSyncAt'>) => void;
}

const PRESET_COLORS = [
  '#0284c7', // Sky
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#e11d48', // Rose
];

export function AddCollaboratorModal({ isOpen, onClose, onAdd }: AddCollaboratorModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [department, setDepartment] = useState<Department>('comercial');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);

  if (!isOpen) return null;

  const handleConnectWithGoogleOAuth = async () => {
    setIsAuthenticatingGoogle(true);
    try {
      const res = await fetch('/api/calendar/auth');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.info('Para autenticação OAuth direta, configure o GOOGLE_CLIENT_ID no arquivo .env.local. Cadastrando colaborador diretamente.');
      }
    } catch {
      toast.error('Erro ao iniciar fluxo OAuth do Google');
    } finally {
      setIsAuthenticatingGoogle(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Preencha nome e e-mail do colaborador');
      return;
    }

    const initials = name
      .trim()
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    onAdd({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      roleTitle: roleTitle.trim() || 'Colaborador',
      department,
      avatar: initials || 'N',
      color,
      googleCalendarId: email.trim().toLowerCase(),
      googleConnected: true,
      isVisible: true,
    });

    toast.success(`Colaborador ${name} conectado à agenda!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Conectar Novo Colaborador
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Integração com Google Calendar e Google Workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Botão OAuth Google */}
          <button
            type="button"
            onClick={handleConnectWithGoogleOAuth}
            disabled={isAuthenticatingGoogle}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Conectar via Google Login (OAuth 2.0)</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] uppercase font-bold text-slate-400">ou preencha manualmente</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Beatriz Lima"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              E-mail Google Workspace *
            </label>
            <input
              type="email"
              required
              placeholder="beatriz@nexusflow.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Cargo / Função
              </label>
              <input
                type="text"
                placeholder="Ex: Consultor Comercial"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Departamento
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="comercial">Comercial / Vendas</option>
                <option value="engenharia">Engenharia / TI</option>
                <option value="executivo">Executivo / C-Level</option>
                <option value="produto">Produto / Design</option>
              </select>
            </div>
          </div>

          {/* Seletor de Cor no Calendário */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Cor de Identificação no Calendário
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer ${
                    color === c ? 'scale-110 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Rodapé */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25 transition cursor-pointer active:scale-95"
            >
              Conectar Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
