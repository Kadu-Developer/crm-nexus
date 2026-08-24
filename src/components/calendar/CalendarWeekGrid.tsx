'use client';

import React from 'react';
import { CalendarEvent, CollaboratorAccount, CalendarCategory } from '@/types/calendar';
import { Video, Repeat, Sparkles, Flame, Users } from 'lucide-react';

interface CalendarWeekGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  accounts: CollaboratorAccount[];
  categories: CalendarCategory[];
  showWeekends: boolean;
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateSlotEvent: (dateStr: string, hour: number) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
}

export function CalendarWeekGrid({
  currentDate,
  events,
  accounts,
  categories,
  showWeekends,
  onSelectEvent,
  onCreateSlotEvent,
  onOpenOpportunity,
}: CalendarWeekGridProps) {
  const HOUR_HEIGHT = 60;
  const START_HOUR = 6;
  const END_HOUR = 22;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  const getWeekDays = () => {
    const current = new Date(currentDate);
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek;
    
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      d.setDate(diff + i);
      weekDays.push(d);
    }

    if (!showWeekends) {
      return weekDays.filter((_, idx) => idx >= 1 && idx <= 5);
    }
    return weekDays;
  };

  const weekDays = getWeekDays();

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const today = new Date();

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const isNowInGrid = currentHour >= START_HOUR && currentHour < END_HOUR;
  const nowTopPosition = ((currentHour - START_HOUR) + currentMinutes / 60) * HOUR_HEIGHT;

  const hoursArray = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  const getCollabInfo = (collabId?: string) => {
    if (!collabId || collabId === 'all_team' || collabId === 'both') {
      return {
        name: 'Toda a Equipe',
        color: '#0284c7',
        avatar: 'ALL',
      };
    }
    const found = accounts.find((a) => a.id === collabId);
    if (found) return found;

    // Fallback por prefixo
    const fallback = accounts.find((a) => a.id.includes(collabId) || collabId.includes(a.id));
    return fallback || {
      name: 'Colaborador',
      color: '#6366f1',
      avatar: 'N',
    };
  };

  const getCategoryInfo = (catId: string) => {
    return categories.find((c) => c.id === catId) || categories[0];
  };

  return (
    <div className="flex-1 flex flex-col min-w-[750px] overflow-x-auto bg-white dark:bg-slate-900 select-none">
      {/* Cabeçalho das Colunas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
        <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 p-2 text-right">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">GMT-3</span>
        </div>

        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))` }}>
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, currentDate);
            const dayName = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const dayNumber = day.getDate();

            return (
              <div
                key={idx}
                className={`py-2 px-1 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 transition ${
                  isToday ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {dayName}
                </div>
                <div className="mt-0.5 inline-flex items-center justify-center">
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isToday
                        ? 'bg-blue-600 text-white font-black shadow-xs shadow-blue-500/40'
                        : isSelected
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade de Horários */}
      <div className="flex-1 relative flex overflow-y-auto max-h-[calc(100vh-12.5rem)]">
        <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 select-none">
          {hoursArray.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="border-b border-slate-100 dark:border-slate-800/60 pr-2 pt-1 text-right text-[11px] font-mono text-slate-500 dark:text-slate-400"
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        <div
          className="flex-1 grid relative"
          style={{ gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))` }}
        >
          {/* Linhas de Fundo */}
          <div className="absolute inset-0 pointer-events-none">
            {hoursArray.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="border-b border-slate-100 dark:border-slate-800/60 w-full"
              />
            ))}
          </div>

          {/* Linha de Hora Atual */}
          {isNowInGrid && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
              style={{ top: `${nowTopPosition}px` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400 -ml-1.5 shadow-sm animate-pulse" />
              <div className="flex-1 h-0.5 bg-blue-600 dark:bg-cyan-400 shadow-sm" />
            </div>
          )}

          {/* Colunas dos Dias */}
          {weekDays.map((day, dayIdx) => {
            const dateStr = day.toISOString().split('T')[0];

            const dayEvents = events.filter((e) => {
              if (e.status === 'cancelled') return false;
              const eDate = new Date(e.startTime);
              return (
                eDate.getFullYear() === day.getFullYear() &&
                eDate.getMonth() === day.getMonth() &&
                eDate.getDate() === day.getDate()
              );
            });

            return (
              <div
                key={dayIdx}
                className="relative border-r border-slate-200 dark:border-slate-800 last:border-r-0 h-full"
                style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
              >
                {/* Clique para Agendar */}
                {hoursArray.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => onCreateSlotEvent(dateStr, hour)}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="hover:bg-blue-500/5 transition cursor-pointer"
                    title={`Clique para agendar em ${dateStr} às ${hour}:00`}
                  />
                ))}

                {/* Eventos */}
                {dayEvents.map((evt) => {
                  const start = new Date(evt.startTime);
                  const end = new Date(evt.endTime);

                  const startHourFraction =
                    start.getHours() + start.getMinutes() / 60 - START_HOUR;
                  const durationHours =
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                  const topPos = Math.max(0, startHourFraction * HOUR_HEIGHT);
                  const heightPos = Math.max(26, durationHours * HOUR_HEIGHT - 2);

                  const collab = getCollabInfo(evt.collaboratorId || evt.ctoId);
                  const category = getCategoryInfo(evt.categoryId);

                  const startTimeFormatted = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
                  const endTimeFormatted = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      style={{
                        top: `${topPos}px`,
                        height: `${heightPos}px`,
                        left: '3px',
                        right: '3px',
                        borderLeftWidth: '4px',
                        borderLeftColor: collab.color,
                      }}
                      className={`absolute z-10 p-1.5 rounded-lg border text-left shadow-xs transition hover:shadow-md hover:scale-[1.01] hover:z-20 cursor-pointer overflow-hidden flex flex-col justify-between ${
                        category.bgLight
                      } ${category.bgDark} backdrop-blur-xs`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-mono font-bold tracking-tight opacity-90 truncate">
                            {startTimeFormatted} - {endTimeFormatted}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {evt.recurrence && evt.recurrence !== 'none' && (
                              <span title="Evento recorrente" className="inline-flex">
                                <Repeat className="w-2.5 h-2.5 opacity-70" />
                              </span>
                            )}

                            {evt.meetUrl && (
                              <span className="p-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-cyan-300" title="Possui Google Meet">
                                <Video className="w-2.5 h-2.5" />
                              </span>
                            )}

                            {/* Badge do Colaborador Responsável */}
                            <span
                              className="text-[9px] font-black px-1 py-0.2 rounded text-white shadow-xs"
                              style={{ backgroundColor: collab.color }}
                              title={`Responsável: ${collab.name}`}
                            >
                              {collab.avatar}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-bold leading-tight line-clamp-2">
                          {evt.title}
                        </p>
                      </div>

                      {evt.opportunityCompanyName && (
                        <div className="mt-1 pt-1 border-t border-current/10 flex items-center justify-between gap-1 text-[10px]">
                          <span
                            onClick={(e) => {
                              if (evt.linkedOpportunityId && onOpenOpportunity) {
                                e.stopPropagation();
                                onOpenOpportunity(evt.linkedOpportunityId);
                              }
                            }}
                            className="font-bold flex items-center gap-1 hover:underline cursor-pointer truncate"
                            title="Abrir Oportunidade no CRM"
                          >
                            <Flame className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span className="truncate">{evt.opportunityCompanyName}</span>
                          </span>

                          {evt.opportunityScore && (
                            <span className="font-mono font-bold opacity-80 shrink-0">
                              {evt.opportunityScore} pts
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
