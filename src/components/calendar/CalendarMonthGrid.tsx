'use client';

import React from 'react';
import { CalendarEvent, CollaboratorAccount, CalendarCategory } from '@/types/calendar';
import { Video, Flame } from 'lucide-react';

interface CalendarMonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  accounts: CollaboratorAccount[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDay: (date: Date) => void;
  onCreateSlotEvent: (dateStr: string, hour: number) => void;
}

export function CalendarMonthGrid({
  currentDate,
  events,
  accounts,
  categories,
  onSelectEvent,
  onSelectDay,
  onCreateSlotEvent,
}: CalendarMonthGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayIndex = firstDayOfMonth.getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  interface MonthCell {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
  }

  const cells: MonthCell[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    cells.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, new Date()),
    });
  }

  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({
      date: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, new Date()),
    });
  }

  const remaining = 35 - cells.length > 0 ? 35 - cells.length : (42 - cells.length > 0 ? 42 - cells.length : 0);
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, new Date()),
    });
  }

  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  const getCollabInfo = (collabId?: string) => {
    if (!collabId || collabId === 'all_team' || collabId === 'both') {
      return { name: 'Equipe', color: '#0284c7', avatar: 'ALL' };
    }
    const found = accounts.find((a) => a.id === collabId || a.id.includes(collabId) || collabId.includes(a.id));
    return found || { name: 'Colaborador', color: '#6366f1', avatar: 'N' };
  };

  const getCategoryInfo = (catId: string) => {
    return categories.find((c) => c.id === catId) || categories[0];
  };

  return (
    <div className="flex-1 flex flex-col min-w-[750px] h-full overflow-y-auto overflow-x-auto bg-white dark:bg-slate-900 select-none">
      {/* Cabeçalho (Sticky no topo dentro do mesmo scroll container) */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shrink-0">
        {weekDayLabels.map((label, idx) => (
          <div
            key={idx}
            className="py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grade 7x5 */}
      <div
        className="flex-1 grid grid-cols-7 auto-rows-fr shrink-0"
        style={{ minHeight: '600px' }}
      >
        {cells.map((cell, idx) => {
          const dateStr = cell.date.toISOString().split('T')[0];

          const dayEvents = events.filter((e) => {
            if (e.status === 'cancelled') return false;
            const eDate = new Date(e.startTime);
            return (
              eDate.getFullYear() === cell.date.getFullYear() &&
              eDate.getMonth() === cell.date.getMonth() &&
              eDate.getDate() === cell.date.getDate()
            );
          });

          return (
            <div
              key={idx}
              onClick={() => onSelectDay(cell.date)}
              className={`min-h-[110px] p-1.5 border-b border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer ${
                !cell.isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-950/40 opacity-40' : ''
              } ${cell.isToday ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
            >
              {/* Header do dia */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    cell.isToday
                      ? 'bg-blue-600 text-white font-black shadow-xs shadow-blue-500/40'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cell.date.getDate()}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {dayEvents.length} {dayEvents.length === 1 ? 'evt' : 'evts'}
                  </span>
                )}
              </div>

              {/* Lista de pílulas */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((evt) => {
                  const start = new Date(evt.startTime);
                  const startTimeFormatted = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
                  const collab = getCollabInfo(evt.collaboratorId || evt.ctoId);
                  const cat = getCategoryInfo(evt.categoryId);

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      style={{ borderLeftColor: collab.color }}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-medium border-l-2 truncate shadow-xs transition hover:scale-[1.02] flex items-center gap-1 ${
                        cat.bgLight
                      } ${cat.bgDark}`}
                    >
                      <span className="font-mono text-[9px] opacity-80 shrink-0">
                        {startTimeFormatted}
                      </span>
                      <span className="truncate">{evt.title}</span>
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold pl-1">
                    +{dayEvents.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
