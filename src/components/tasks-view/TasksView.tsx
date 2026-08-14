'use client';

import React from 'react';
import { Opportunity, Activity } from '@/types/crm';
import { formatDateTime, isActionOverdue, isActionToday } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, Phone, MessageSquare, Mail, Video, Calendar, ArrowRight, Building2, Flame } from 'lucide-react';

interface TasksViewProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  consultantFilter: string;
}

export function TasksView({ opportunities, onSelectOpportunity, consultantFilter }: TasksViewProps) {
  const filteredOpportunities = opportunities.filter((opp) => {
    if (consultantFilter === 'all') return true;
    return opp.consultantId === consultantFilter;
  });

  const overdueTasks = filteredOpportunities.filter((opp) => isActionOverdue(opp.nextActionDate) && !isActionToday(opp.nextActionDate));
  const todayTasks = filteredOpportunities.filter((opp) => isActionToday(opp.nextActionDate));
  const upcomingTasks = filteredOpportunities.filter((opp) => !isActionOverdue(opp.nextActionDate) && !isActionToday(opp.nextActionDate));

  const renderTaskCard = (opp: Opportunity, status: 'overdue' | 'today' | 'upcoming') => (
    <div
      key={opp.id}
      onClick={() => onSelectOpportunity(opp)}
      className="p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/60 rounded-xl transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
    >
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-100 group-hover:text-blue-300 transition">
            {opp.tradeName || opp.companyName}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              opp.score >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            🔥 {opp.score} pts
          </span>
          <span className="text-xs text-slate-400 font-mono">({opp.city}/{opp.state})</span>
        </div>

        <p className="text-sm text-slate-200 font-medium flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
          {opp.nextActionDescription}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
          <span>
            👤 Consultor: <strong className="text-slate-300">{opp.consultantName}</strong>
          </span>
          {opp.contacts[0] && (
            <span>
              📞 Contato: <strong className="text-slate-300">{opp.contacts[0].name}</strong> ({opp.contacts[0].jobTitle})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
        <div className="text-right">
          <span className="block text-[11px] text-slate-400 uppercase font-semibold">Agendado para</span>
          <span
            className={`text-xs font-mono font-bold ${
              status === 'overdue' ? 'text-rose-400' : status === 'today' ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {formatDateTime(opp.nextActionDate)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectOpportunity(opp);
          }}
          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-semibold border border-blue-500/30 transition"
        >
          Concluir / Abrir Ficha
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Seção 1: Atrasadas */}
      {overdueTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <span>⚠️ Ações Atrasadas ({overdueTasks.length}) — Atenção Imediata</span>
          </div>
          <div className="space-y-2.5">
            {overdueTasks.map((opp) => renderTaskCard(opp, 'overdue'))}
          </div>
        </div>
      )}

      {/* Seção 2: Hoje */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
          <Clock className="w-5 h-5" />
          <span>📅 Agendado para Hoje ({todayTasks.length})</span>
        </div>
        {todayTasks.length > 0 ? (
          <div className="space-y-2.5">
            {todayTasks.map((opp) => renderTaskCard(opp, 'today'))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            Nenhuma ação agendada especificamente para hoje.
          </div>
        )}
      </div>

      {/* Seção 3: Próximos Dias */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
          <Calendar className="w-5 h-5" />
          <span>🚀 Próximas Ações Agendadas ({upcomingTasks.length})</span>
        </div>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-2.5">
            {upcomingTasks.map((opp) => renderTaskCard(opp, 'upcoming'))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            Nenhuma ação futura agendada.
          </div>
        )}
      </div>
    </div>
  );
}
