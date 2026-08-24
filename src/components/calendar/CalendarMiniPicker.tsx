'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarMiniPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarMiniPicker({ selectedDate, onSelectDate }: CalendarMiniPickerProps) {
  const [viewMonth, setViewMonth] = React.useState<Date>(new Date(selectedDate));

  // Sincronizar viewMonth quando selectedDate muda externamente
  React.useEffect(() => {
    setViewMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const prevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  // Primeiro dia do mês (0-6)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total de dias no mês
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  // Total de dias no mês anterior
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Construção dos dias do calendário
  const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

  // Dias do mês anterior
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, new Date()),
      isSelected: isSameDay(d, selectedDate),
    });
  }

  // Dias do mês atual
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, new Date()),
      isSelected: isSameDay(d, selectedDate),
    });
  }

  // Dias do próximo mês para completar 35 ou 42 slots
  const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, new Date()),
      isSelected: isSameDay(d, selectedDate),
    });
  }

  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  return (
    <div className="select-none py-2 px-1">
      {/* Header do Mini Calendário */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {monthNames[month]} <span className="font-mono text-slate-500 dark:text-slate-400">{year}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDayLabels.map((wd, idx) => (
          <span key={idx} className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
            {wd}
          </span>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((item, idx) => {
          const isSelected = item.isSelected;
          const isToday = item.isToday;

          let btnClass = 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800';
          if (!item.isCurrentMonth) {
            btnClass = 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40';
          }
          if (isToday && !isSelected) {
            btnClass = 'text-blue-600 dark:text-cyan-400 font-bold border border-blue-500/40 bg-blue-500/10';
          }
          if (isSelected) {
            btnClass = 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/40';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(item.date)}
              className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-xs transition cursor-pointer ${btnClass}`}
            >
              {item.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
