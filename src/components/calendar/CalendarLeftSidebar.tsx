'use client';

import React, { useState } from 'react';
import { CalendarMiniPicker } from './CalendarMiniPicker';
import { CollaboratorAccount, CalendarCategory, Department } from '@/types/calendar';
import { Search, Settings, Plus, Check, RefreshCw, Layers, Users, UserPlus, CheckCheck, Square } from 'lucide-react';

interface CalendarLeftSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  accounts: CollaboratorAccount[];
  onToggleAccount: (id: string) => void;
  onToggleAllAccounts: (visible: boolean) => void;
  categories: CalendarCategory[];
  onToggleCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenGoogleSettings: () => void;
  onOpenAddCollaborator: () => void;
  onSyncGoogle: () => void;
  isSyncing: boolean;
}

export function CalendarLeftSidebar({
  selectedDate,
  onSelectDate,
  accounts,
  onToggleAccount,
  onToggleAllAccounts,
  categories,
  onToggleCategory,
  searchQuery,
  onSearchChange,
  onOpenGoogleSettings,
  onOpenAddCollaborator,
  onSyncGoogle,
  isSyncing,
}: CalendarLeftSidebarProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('all');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');

  const filteredCollaborators = accounts.filter((acc) => {
    if (selectedDepartment !== 'all' && acc.department !== selectedDepartment) {
      return false;
    }
    if (collaboratorSearch.trim()) {
      const q = collaboratorSearch.toLowerCase();
      return acc.name.toLowerCase().includes(q) || acc.email.toLowerCase().includes(q) || acc.roleTitle.toLowerCase().includes(q);
    }
    return true;
  });

  const allVisible = accounts.every((a) => a.isVisible);
  const visibleAccountsCount = accounts.filter((a) => a.isVisible).length;

  return (
    <aside className="hidden lg:flex w-68 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md p-3.5 space-y-4 overflow-y-auto h-full select-none">
      {/* Mini Calendário */}
      <CalendarMiniPicker selectedDate={selectedDate} onSelectDate={onSelectDate} />

      <div className="h-px bg-slate-200 dark:bg-slate-800" />

      {/* Busca rápida de eventos */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar compromisso..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Seção: Colaboradores da Empresa (Google Workspace) */}
      <div className="space-y-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Colaboradores ({visibleAccountsCount}/{accounts.length})
            </span>
          </div>

          {/* Botão Único: Conectar / Logar Google Agenda */}
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/calendar/auth');
                const data = await res.json();
                if (data.authUrl) {
                  window.open(data.authUrl, '_blank');
                }
              } catch {
                onOpenGoogleSettings();
              }
            }}
            className="w-full py-2 px-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 hover:border-blue-400 dark:hover:border-blue-600 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition cursor-pointer shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-[11px] group-hover:text-blue-600 dark:group-hover:text-cyan-400">Conectar Google Agenda</span>
            </div>
            <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">OAuth ➔</span>
          </button>
        </div>

        {/* Filtro de Departamentos */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
          <button
            type="button"
            onClick={() => setSelectedDepartment('all')}
            className={`px-2 py-0.5 rounded-md font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDepartment === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setSelectedDepartment('executivo')}
            className={`px-2 py-0.5 rounded-md font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDepartment === 'executivo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            C-Level / CTOs
          </button>
          <button
            type="button"
            onClick={() => setSelectedDepartment('comercial')}
            className={`px-2 py-0.5 rounded-md font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDepartment === 'comercial'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Comercial
          </button>
          <button
            type="button"
            onClick={() => setSelectedDepartment('engenharia')}
            className={`px-2 py-0.5 rounded-md font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDepartment === 'engenharia'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Engenharia
          </button>
        </div>

        {/* Atalho Selecionar / Desmarcar Todos */}
        <div className="flex items-center justify-between px-1 text-[10px] text-slate-500">
          <span>{filteredCollaborators.length} membros listados</span>
          <button
            type="button"
            onClick={() => onToggleAllAccounts(!allVisible)}
            className="text-blue-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            {allVisible ? 'Ocultar todos' : 'Exibir todos'}
          </button>
        </div>

        {/* Lista de Colaboradores */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
          {filteredCollaborators.map((acc) => (
            <div
              key={acc.id}
              onClick={() => onToggleAccount(acc.id)}
              className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                acc.isVisible
                  ? 'bg-slate-100/90 dark:bg-slate-800/80 border-slate-300/80 dark:border-slate-700 shadow-xs'
                  : 'bg-transparent border-transparent opacity-50 hover:opacity-80 hover:bg-slate-100/40 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Checkbox customizado */}
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                    acc.isVisible ? 'text-white' : 'border-slate-400 dark:border-slate-600 bg-transparent'
                  }`}
                  style={{
                    backgroundColor: acc.isVisible ? acc.color : 'transparent',
                    borderColor: acc.color,
                  }}
                >
                  {acc.isVisible && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>

                {/* Avatar */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: acc.color }}
                >
                  {acc.avatar}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </p>
                    <span className="text-[10px] shrink-0" title="Google Workspace Conectado">
                      <svg className="w-2.5 h-2.5 inline" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {acc.roleTitle}
                  </p>
                </div>
              </div>

              {/* Status Dot */}
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0 ml-1"
                style={{
                  backgroundColor: acc.syncStatus === 'synced' ? '#10b981' : '#f59e0b',
                }}
                title={`Status: ${acc.syncStatus === 'synced' ? 'Sincronizado' : 'Pendente'}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800" />

      {/* Seção: Camadas e Categorias */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>Camadas de Reunião</span>
          </div>
        </div>

        <div className="space-y-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onToggleCategory(cat.id)}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                cat.isVisible
                  ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-400 dark:text-slate-400 opacity-60 hover:opacity-80'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                  cat.isVisible ? 'text-white' : 'border-slate-400 dark:border-slate-600 bg-transparent'
                }`}
                style={{
                  backgroundColor: cat.isVisible ? cat.color : 'transparent',
                  borderColor: cat.color,
                }}
              >
                {cat.isVisible && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span className="truncate">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
