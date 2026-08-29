'use client';

import React from 'react';
import { CalendarViewMode } from '@/types/calendar';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onNewEvent: () => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onNewEvent,
}: CalendarHeaderProps) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatHeaderTitle = () => {
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    if (viewMode === 'day') {
      const day = currentDate.getDate();
      const weekDayName = currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      return `${day} de ${month} ${year} • ${weekDayName.charAt(0).toUpperCase() + weekDayName.slice(1)}`;
    }

    return `${month} ${year}`;
  };

  return (
    <header className="h-14 min-h-[3.5rem] border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between gap-3 select-none shrink-0">
      {/* Esquerda: Navegação e Data */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Botão Hoje */}
        <button
          type="button"
          onClick={onNavigateToday}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <span className="hidden sm:inline">Hoje</span>
          <span className="inline sm:hidden">
            <CalendarIcon className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Setas Prev / Next */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onNavigatePrev}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNavigateNext}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer active:scale-95"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Título da Data & Fuso Horário */}
        <div className="flex items-center gap-2.5 ml-1 sm:ml-2 min-w-0">
          <h2 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
            {formatHeaderTitle()}
          </h2>

          {/* Fuso Horário Badge */}
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60 shrink-0">
            <Clock className="w-3 h-3 text-slate-400" />
            GMT-3 (Brasília)
          </span>
        </div>
      </div>

      {/* Direita: Modos de Visão, Opções de Exibição & Botão Novo Evento */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Seletor de Modo de Visão (Semana / Dia / Mês / Agenda) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onViewModeChange('week')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              viewMode === 'week'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('day')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              viewMode === 'day'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dia
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('month')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              viewMode === 'month'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mês
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('agenda')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Lista
          </button>
        </div>

        {/* Botão Novo Evento CTA */}
        <button
          type="button"
          onClick={onNewEvent}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-blue-600/30 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Novo Evento</span>
        </button>
      </div>
    </header>
  );
}
