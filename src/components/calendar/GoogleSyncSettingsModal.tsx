'use client';

import React, { useState, useEffect } from 'react';
import { GoogleIntegrationSettings, CollaboratorAccount } from '@/types/calendar';
import { X, RefreshCw, CheckCircle2, ShieldCheck, Key, Globe, Radio, Bell, ExternalLink, Zap, Users, UserPlus, LogIn, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { openGoogleOAuthPopup } from '@/lib/google-auth';
import { calendarService } from '@/lib/supabase/calendar-service';

interface GoogleSyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GoogleIntegrationSettings;
  onSaveSettings: (settings: GoogleIntegrationSettings) => void;
  accounts: CollaboratorAccount[];
  onSyncGoogle: () => void;
  isSyncing: boolean;
  onClearEvents?: () => void;
}

export function GoogleSyncSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  accounts,
  onSyncGoogle,
  isSyncing,
  onClearEvents,
}: GoogleSyncSettingsModalProps) {
  const [formData, setFormData] = useState<GoogleIntegrationSettings>(settings);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  const handleClearEvents = async () => {
    if (!confirm('Deseja realmente limpar TODOS os eventos da base de dados do calendário? Esta ação não pode ser desfeita.')) {
      return;
    }
    setIsClearing(true);
    try {
      const res = await calendarService.clearAllEvents();
      if (res.success) {
        toast.success('Base de dados de eventos limpa com sucesso!');
        if (onClearEvents) onClearEvents();
        onClose();
      } else {
        toast.error('Erro ao limpar base de eventos');
      }
    } catch {
      toast.error('Erro de conexão ao limpar base de eventos');
    } finally {
      setIsClearing(false);
    }
  };

  if (!isOpen) return null;

  const handleStartGoogleOAuth = async () => {
    setIsAuthorizing(true);
    try {
      const res = await fetch('/api/calendar/auth?redirect=/?view=calendar');
      const data = await res.json();
      if (data.authUrl) {
        openGoogleOAuthPopup(data.authUrl);
      } else {
        toast.info('Para conectar diretamente, informe o Client ID e Secret abaixo ou adicione ao .env.local.');
      }
    } catch {
      toast.error('Erro ao chamar autenticação do Google');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    toast.success('Configurações salvas com sucesso!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Integração Oficial Google Workspace (API v3 & OAuth 2.0)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sincronização bidirecional em tempo real com o Google Calendar
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

        {/* Formulário e Status */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Ação de Conexão Rápida OAuth */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-cyan-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                Conectar Conta Google via OAuth 2.0 Oficial
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Autorize o CRM Nexus a ler e sincronizar eventos com sua conta Google.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartGoogleOAuth}
              disabled={isAuthorizing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm shadow-blue-500/30 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isAuthorizing ? 'Redirecionando...' : 'Autorizar Google'}</span>
            </button>
          </div>

          {/* Status das Contas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Colaboradores Ativos ({accounts.length})
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Domínio: {formData.domain}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[7px] font-black shrink-0"
                        style={{ backgroundColor: acc.color }}
                      >
                        {acc.avatar}
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white truncate text-[11px]">
                        {acc.name}
                      </p>
                    </div>
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: acc.syncStatus === 'synced' ? '#10b981' : '#f59e0b' }}
                      title="Sincronizado"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono truncate">{acc.email}</p>
                </div>
              ))}
            </div>

            {/* Botão de Sync Geral */}
            <button
              type="button"
              onClick={onSyncGoogle}
              disabled={isSyncing}
              className="w-full py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-cyan-400 font-bold flex items-center justify-center gap-2 border border-blue-500/20 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Buscando eventos na API do Google...' : 'Sincronizar Todas as Agendas Agora'}</span>
            </button>

            {/* Botão de Limpar Base de Eventos */}
            <button
              type="button"
              onClick={handleClearEvents}
              disabled={isClearing}
              className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 border border-red-500/20 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearing ? 'Limpando base de dados...' : 'Limpar Todos os Eventos da Base'}</span>
            </button>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800" />

          {/* Credenciais */}
          <div className="space-y-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Credenciais da Google Cloud Console
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Domínio Corporativo</span>
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                  <Key className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Client ID</span>
                </label>
                <input
                  type="text"
                  value={formData.googleClientId || ''}
                  onChange={(e) => setFormData({ ...formData, googleClientId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Endpoint do Webhook de Eventos em Tempo Real</span>
              </label>
              <input
                type="text"
                value={formData.webhookUrl || ''}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Rodapé */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition cursor-pointer active:scale-95"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
