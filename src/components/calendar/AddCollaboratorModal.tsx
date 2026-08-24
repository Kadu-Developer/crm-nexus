'use client';

import React, { useState } from 'react';
import { CollaboratorAccount, Department } from '@/types/calendar';
import { X, UserPlus, Mail, Shield, Check, Sparkles, LogIn, Lock, Copy, KeyRound, CheckCircle2 } from 'lucide-react';
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
  const [role, setRole] = useState<'consultant' | 'admin_ceo' | 'viewer'>('consultant');
  const [tempPassword, setTempPassword] = useState('Nexus@2026');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; tempPass: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Olá! Seguem seus dados de acesso ao CRM Nexus:\n\n🔗 Link: ${window.location.origin}\n📧 E-mail: ${createdCredentials.email}\n🔑 Senha Provisória: ${createdCredentials.tempPass}\n\nNo primeiro acesso, você deverá cadastrar sua nova senha definitiva.`;
    navigator.clipboard.writeText(text);
    toast.success('Dados de acesso copiados para a área de transferência!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Preencha nome e e-mail do colaborador');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Cadastra no backend (Supabase Auth + Profiles + Calendar)
      const res = await fetch('/api/admin/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          roleTitle: roleTitle.trim() || 'Consultor Comercial',
          department,
          role,
          tempPassword: tempPassword.trim() || 'Nexus@2026',
          color,
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.success) {
        toast.error(data.error || 'Erro ao cadastrar colaborador');
      } else {
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

        setCreatedCredentials({
          email: email.trim().toLowerCase(),
          tempPass: tempPassword.trim() || 'Nexus@2026',
        });

        toast.success(`Colaborador ${name} cadastrado com sucesso!`);
      }
    } catch {
      toast.error('Erro de conexão ao cadastrar colaborador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Cadastrar Novo Colaborador no Sistema
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cria o usuário no Supabase Auth com troca de senha obrigatória no 1º login
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCreatedCredentials(null);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {createdCredentials ? (
          /* Tela de Sucesso com Credenciais para Compartilhar */
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Colaborador Cadastrado!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Envie as credenciais abaixo para o colaborador. No primeiro acesso, o sistema exigirá que ele defina sua senha definitiva.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">E-MAIL DE ACESSO:</span>
                <span className="font-bold text-slate-900 dark:text-white">{createdCredentials.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">SENHA PROVISÓRIA:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{createdCredentials.tempPass}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 transition cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Mensagem de Acesso</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreatedCredentials(null);
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Cadastro */
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
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
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                placeholder="beatriz@nexusflowtech.com.br"
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
                  placeholder="Ex: SDR Outbound"
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

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Permissão no CRM
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="consultant">Consultor (Vê seus leads)</option>
                  <option value="admin_ceo">Admin / CEO (Acesso Total)</option>
                  <option value="viewer">Visualizador (Somente Leitura)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Senha Provisória
                </label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
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
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold shadow-md shadow-blue-500/25 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Cadastrando...' : 'Cadastrar Colaborador'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
