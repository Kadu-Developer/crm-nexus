'use client';

import React from 'react';
import { CalendarEvent, CollaboratorAccount, CalendarCategory } from '@/types/calendar';
import { Video, Repeat, Flame, Clock, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

interface CalendarAgendaListProps {
  events: CalendarEvent[];
  accounts: CollaboratorAccount[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
}

export function CalendarAgendaList({
  events,
  accounts,
  categories,
  onSelectEvent,
  onOpenOpportunity,
}: CalendarAgendaListProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const groupedByDate: { [dateStr: string]: CalendarEvent[] } = {};
  sortedEvents.forEach((evt) => {
    const dStr = evt.startTime.split('T')[0];
    if (!groupedByDate[dStr]) {
      groupedByDate[dStr] = [];
    }
    groupedByDate[dStr].push(evt);
  });

  const getCollabInfo = (collabId?: string) => {
    if (!collabId || collabId === 'all_team' || collabId === 'both') {
      return { name: 'Toda a Equipe', color: '#0284c7', avatar: 'ALL' };
    }
    const found = accounts.find((a) => a.id === collabId || a.id.includes(collabId) || collabId.includes(a.id));
    return found || { name: 'Colaborador', color: '#6366f1', avatar: 'N' };
  };

  const getCategoryInfo = (catId: string) => {
    return categories.find((c) => c.id === catId) || categories[0];
  };

  const formatDateHeader = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    const formatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    return `${formatted} • ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}`;
  };

  const isToday = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return dateStr === todayStr;
  };

  const dateKeys = Object.keys(groupedByDate);

  if (dateKeys.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900">
        <Calendar className="w-12 h-12 stroke-[1.5] mb-3 text-slate-400" />
        <p className="text-sm font-semibold">Nenhum evento encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-12.5rem)] bg-white dark:bg-slate-900">
      {dateKeys.map((dateStr) => {
        const dayEvents = groupedByDate[dateStr];
        const todayHighlight = isToday(dateStr);

        return (
          <div key={dateStr} className="space-y-3">
            {/* Header da Data */}
            <div className="flex items-center gap-2 sticky top-0 bg-white/95 dark:bg-slate-900/95 py-1 z-10">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  todayHighlight
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {formatDateHeader(dateStr)}
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Lista de Eventos do Dia */}
            <div className="space-y-2 pl-2">
              {dayEvents.map((evt) => {
                const start = new Date(evt.startTime);
                const end = new Date(evt.endTime);
                const startTimeFormatted = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
                const endTimeFormatted = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
                const collab = getCollabInfo(evt.collaboratorId || evt.ctoId);
                const cat = getCategoryInfo(evt.categoryId);

                return (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:border-blue-500/60 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Avatar do Colaborador */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5 shadow-xs"
                        style={{ backgroundColor: collab.color }}
                        title={`Responsável: ${collab.name}`}
                      >
                        {collab.avatar}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                            {evt.title}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }}
                          >
                            {cat.name}
                          </span>
                          {evt.meetUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-cyan-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                              <Video className="w-3 h-3" /> Meet
                            </span>
                          )}
                        </div>

                        {evt.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {evt.description}
                          </p>
                        )}

                        {evt.opportunityCompanyName && (
                          <div className="flex items-center gap-2 pt-0.5 text-xs">
                            <span
                              onClick={(e) => {
                                if (evt.linkedOpportunityId && onOpenOpportunity) {
                                  e.stopPropagation();
                                  onOpenOpportunity(evt.linkedOpportunityId);
                                }
                              }}
                              className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Flame className="w-3 h-3" />
                              {evt.opportunityCompanyName}
                            </span>
                            {evt.opportunityScore && (
                              <span className="text-[10px] font-mono text-slate-400">
                                ({evt.opportunityScore} pts)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Horário e Ações */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700/60 pt-2 md:pt-0">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          {startTimeFormatted} - {endTimeFormatted}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                          {collab.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white text-xs font-bold transition cursor-pointer"
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
