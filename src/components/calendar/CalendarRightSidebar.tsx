'use client';

import React, { useState } from 'react';
import { CalendarEvent, CollaboratorAccount, FreeTimeSlot } from '@/types/calendar';
import { Plus, RefreshCw, CheckCircle2, Clock, Sparkles, Flame, UserCheck, ChevronRight, Users } from 'lucide-react';

interface CalendarRightSidebarProps {
  events: CalendarEvent[];
  accounts: CollaboratorAccount[];
  selectedDate: Date;
  onSelectEvent: (event: CalendarEvent) => void;
  onNewEvent: () => void;
  onBookFreeSlot: (slot: FreeTimeSlot) => void;
  onSyncGoogle: () => void;
  isSyncing: boolean;
  freeSlots: FreeTimeSlot[];
}

export function CalendarRightSidebar({
  events,
  accounts,
  selectedDate,
  onSelectEvent,
  onNewEvent,
  onBookFreeSlot,
  onSyncGoogle,
  isSyncing,
  freeSlots,
}: CalendarRightSidebarProps) {
  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(e.endTime) >= now && e.status !== 'cancelled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 6);

  const getCollabInfo = (collabId?: string) => {
    if (!collabId || collabId === 'all_team' || collabId === 'both') {
      return { name: 'Equipe', color: '#0284c7', avatar: 'ALL' };
    }
    const found = accounts.find((a) => a.id === collabId || a.id.includes(collabId) || collabId.includes(a.id));
    return found || { name: 'Colaborador', color: '#6366f1', avatar: 'N' };
  };

  const formatShortDate = (isoStr: string) => {
    const d = new Date(isoStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const weekDay = d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
    return { dayMonth: `${day} ${month}`, weekDay };
  };

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-8.5rem)] select-none">
      {/* Topo: Status e Botão + Add Task */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Compromissos
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Em dia
          </span>
        </div>

        <button
          type="button"
          onClick={onNewEvent}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm shadow-blue-500/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Tarefa / Reunião</span>
        </button>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800" />

      {/* Seção 1: Smart Slot Finder (Horários Livres da Equipe) */}
      <div className="space-y-2.5 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-cyan-950/30 p-3 rounded-2xl border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Horários Livres em Comum</span>
          </div>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-800 dark:text-cyan-200 px-1.5 py-0.2 rounded font-bold">
            {freeSlots.length} slots
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
          Janelas disponíveis hoje para agendamento com o time:
        </p>

        <div className="space-y-1.5">
          {freeSlots.slice(0, 3).map((slot, idx) => (
            <div
              key={idx}
              onClick={() => onBookFreeSlot(slot)}
              className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-blue-200 dark:border-slate-700 hover:border-transparent transition cursor-pointer flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 group-hover:text-white" />
                <div>
                  <p className="text-xs font-mono font-bold leading-tight">
                    {slot.startTime} - {slot.endTime}
                  </p>
                  <p className="text-[10px] opacity-70 group-hover:text-white/80">
                    {slot.availableCollaborators.length} membros disponíveis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-slate-700 group-hover:bg-white/20">
                <span>Agendar</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}

          {freeSlots.length === 0 && (
            <p className="text-[11px] text-slate-500 text-center py-1">
              Nenhum slot livre no expediente hoje.
            </p>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800" />

      {/* Seção 2: Próximos Compromissos Agendados da Equipe */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Próximos da Fila
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {upcomingEvents.length} eventos
          </span>
        </div>

        <div className="space-y-2">
          {upcomingEvents.map((evt) => {
            const { dayMonth, weekDay } = formatShortDate(evt.startTime);
            const timeStart = formatTime(evt.startTime);
            const timeEnd = formatTime(evt.endTime);
            const collab = getCollabInfo(evt.collaboratorId || evt.ctoId);

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/90 hover:border-blue-500/50 transition cursor-pointer space-y-1.5 shadow-xs group"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {dayMonth}
                  </span>
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700/60 rounded">
                    {weekDay}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0 mt-0.5 shadow-xs"
                    style={{ backgroundColor: collab.color }}
                  >
                    {collab.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                      {evt.title}
                    </p>
                    <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{timeStart} - {timeEnd}</span>
                      <span className="truncate max-w-[90px]">{collab.name.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                {evt.opportunityCompanyName && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 pt-0.5 truncate">
                    <Flame className="w-3 h-3 shrink-0" />
                    <span className="truncate">{evt.opportunityCompanyName}</span>
                  </div>
                )}
              </div>
            );
          })}

          {upcomingEvents.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">
              Nenhum próximo evento agendado.
            </p>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800" />

      {/* Footer: Sincronização Google Workspace */}
      <button
        type="button"
        onClick={onSyncGoogle}
        disabled={isSyncing}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-xs"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Sincronizando...' : 'Atualizar Google Workspace'}</span>
      </button>
    </aside>
  );
}
