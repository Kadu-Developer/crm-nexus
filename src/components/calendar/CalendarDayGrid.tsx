'use client';

import React from 'react';
import { CalendarEvent, CollaboratorAccount, CalendarCategory } from '@/types/calendar';
import { Video, Repeat, Sparkles, Flame, Clock } from 'lucide-react';

interface CalendarDayGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  accounts: CollaboratorAccount[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateSlotEvent: (dateStr: string, hour: number, collaboratorId?: string) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
}

export function CalendarDayGrid({
  currentDate,
  events,
  accounts,
  categories,
  onSelectEvent,
  onCreateSlotEvent,
  onOpenOpportunity,
}: CalendarDayGridProps) {
  const HOUR_HEIGHT = 68;
  const START_HOUR = 6;
  const END_HOUR = 22;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const hoursArray = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  const dateStr = currentDate.toISOString().split('T')[0];

  // Filtrar eventos deste dia específico
  const dayEvents = events.filter((e) => {
    if (e.status === 'cancelled') return false;
    const eDate = new Date(e.startTime);
    return (
      eDate.getFullYear() === currentDate.getFullYear() &&
      eDate.getMonth() === currentDate.getMonth() &&
      eDate.getDate() === currentDate.getDate()
    );
  });

  const getCategoryInfo = (catId: string) => {
    return categories.find((c) => c.id === catId) || categories[0];
  };

  // Colaboradores visíveis (se nenhum estiver selecionado, exibir todos)
  const visibleAccounts = accounts.filter((a) => a.isVisible);
  const activeAccounts = visibleAccounts.length > 0 ? visibleAccounts : accounts.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col min-w-[700px] overflow-x-auto bg-white dark:bg-slate-900 select-none">
      {/* Cabeçalho do Dia (Colunas dos Colaboradores Selecionados) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
        <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 p-2 text-right">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">GMT-3</span>
        </div>

        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${activeAccounts.length}, minmax(0, 1fr))` }}>
          {activeAccounts.map((acc) => (
            <div
              key={acc.id}
              className="py-2 px-2 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 flex items-center justify-center gap-2"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-xs"
                style={{ backgroundColor: acc.color }}
              >
                {acc.avatar}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {acc.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {acc.roleTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade com Scroll */}
      <div className="flex-1 relative flex overflow-y-auto max-h-[calc(100vh-12.5rem)]">
        {/* Eixo de Horas */}
        <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 select-none">
          {hoursArray.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="border-b border-slate-100 dark:border-slate-800/60 pr-2 pt-1 text-right text-xs font-mono text-slate-500 dark:text-slate-400"
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Colunas dos Colaboradores */}
        <div
          className="flex-1 grid relative"
          style={{ gridTemplateColumns: `repeat(${activeAccounts.length}, minmax(0, 1fr))` }}
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

          {/* Colunas Individuais para cada Colaborador */}
          {activeAccounts.map((acc) => {
            const collabEvents = dayEvents.filter(
              (e) =>
                e.collaboratorId === acc.id ||
                e.collaboratorId === 'all_team' ||
                e.ctoId === acc.id ||
                e.ctoId === 'both' ||
                e.additionalCollaboratorIds?.includes(acc.id)
            );

            return (
              <div
                key={acc.id}
                className="relative border-r border-slate-200 dark:border-slate-800 last:border-r-0 h-full"
                style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
              >
                {/* Áreas Clicáveis para Criar Evento */}
                {hoursArray.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => onCreateSlotEvent(dateStr, hour, acc.id)}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="hover:bg-blue-500/5 transition cursor-pointer"
                    title={`Agendar para ${acc.name} às ${hour}:00`}
                  />
                ))}

                {/* Eventos deste Colaborador */}
                {collabEvents.map((evt) => {
                  const start = new Date(evt.startTime);
                  const end = new Date(evt.endTime);

                  const startHourFraction =
                    start.getHours() + start.getMinutes() / 60 - START_HOUR;
                  const durationHours =
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                  const topPos = Math.max(0, startHourFraction * HOUR_HEIGHT);
                  const heightPos = Math.max(32, durationHours * HOUR_HEIGHT - 2);

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
                        left: '4px',
                        right: '4px',
                        borderLeftWidth: '4px',
                        borderLeftColor: acc.color,
                      }}
                      className={`absolute z-10 p-2 rounded-lg border text-left shadow-xs transition hover:shadow-md hover:scale-[1.01] hover:z-20 cursor-pointer overflow-hidden flex flex-col justify-between ${
                        category.bgLight
                      } ${category.bgDark} backdrop-blur-xs`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-mono font-bold">
                            {startTimeFormatted} - {endTimeFormatted}
                          </span>

                          <div className="flex items-center gap-1">
                            {evt.meetUrl && (
                              <span className="p-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-cyan-300">
                                <Video className="w-3 h-3" />
                              </span>
                            )}
                            <span className="text-[10px] font-medium opacity-80 truncate">
                              {category.name}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-bold leading-tight line-clamp-2">
                          {evt.title}
                        </p>
                      </div>

                      {evt.opportunityCompanyName && (
                        <div className="mt-1 pt-1 border-t border-current/10 flex items-center justify-between text-xs">
                          <span
                            onClick={(e) => {
                              if (evt.linkedOpportunityId && onOpenOpportunity) {
                                e.stopPropagation();
                                onOpenOpportunity(evt.linkedOpportunityId);
                              }
                            }}
                            className="font-bold flex items-center gap-1 hover:underline cursor-pointer truncate"
                          >
                            <Flame className="w-3 h-3 text-amber-500 shrink-0" />
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
