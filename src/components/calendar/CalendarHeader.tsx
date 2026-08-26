'use client';

import React from 'react';
import { CalendarViewMode } from '@/types/calendar';
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal, Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onNewEvent: () => void;
  showWeekends: boolean;
  onToggleWeekends: () => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onNewEvent,
  showWeekends,
  onToggleWeekends,
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
    <header className="h-[3.5rem] min-h-[3.5rem] border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-3 select-none wrap">
      {/* Esquerda: Navegação e Data */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full">
        {/* Botão Hoje */}
        <button
          type="button"
          onClick={onNavigateToday}
          className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer shadow-xs"
        >
          <span className="hidden sm:inline">Hoje</span>
          <span className="inline sm:hidden">
            <CalendarIcon className="w-4 h-4" />
          </span>
        </button>

        {/* Setas Prev / Next */}
        <div className="mt-2 sm:mt-0 sm:ml-4 flex items-center gap-0.5">
          <button
            type="button"
            onClick={onNavigatePrev}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNavigateNext}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Título Data Principal */}
        <div className="mt-2 sm:mt-0 sm:ml-4 flex-1 min-w-0">
          <h2 className="text-sm md:text-base lg:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {formatHeaderTitle()}
          </h2>

          {/* Fuso Horário Badge */}
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
            <Clock className="w-3 h-3 text-slate-400" />
            GMT-3 (Brasília)
          </span>
        </div>
      </div>

      {/* Direita: Modos de Visão, Opções de Exibição & Botão Novo Evento */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Fins de Semana */}
        <button
          type="button"
          onClick={onToggleWeekends}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
            showWeekends
              ? 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Alternar exibição de sábado e domingo"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Fins de semana</span>
        </button>

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
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm shadow-blue-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Novo Evento</span>
        </button>
      </div>
    </header>
  );
}
