'use client';

import React, { useCallback } from 'react';
import { Opportunity, PipelineStage } from '@/types/crm';
import { formatCurrency, formatDateTime, isActionOverdue, isActionToday } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Building2,
  Flame,
  GripVertical,
  TrendingUp,
} from 'lucide-react';

const PIPELINE_GROUPS: { id: string; title: string; stageIds: PipelineStage[]; dropStage: PipelineStage; color: string }[] = [
  {
    id: 'prospeccao',
    title: 'Prospecção',
    stageIds: ['lead_identificado', 'primeiro_contato', 'contato_realizado'],
    dropStage: 'lead_identificado',
    color: '#0757C9',
  },
  {
    id: 'reuniao',
    title: 'Reunião agendada',
    stageIds: ['pre_diag_agendado', 'pre_diag_realizado'],
    dropStage: 'pre_diag_agendado',
    color: '#24C9FF',
  },
  {
    id: 'qualificacao',
    title: 'Qualificação',
    stageIds: ['qualificado', 'diag_proposto', 'diag_contratado', 'diag_realizado'],
    dropStage: 'qualificado',
    color: '#7726D5',
  },
  {
    id: 'proposta',
    title: 'Proposta',
    stageIds: ['solucao_identificada', 'proposta_enviada'],
    dropStage: 'proposta_enviada',
    color: '#ECAF24',
  },
  {
    id: 'negociacao',
    title: 'Negociação',
    stageIds: ['negociacao'],
    dropStage: 'negociacao',
    color: '#F4510B',
  },
  {
    id: 'conclusao',
    title: 'Conclusão',
    stageIds: ['fechado_ganho', 'fechado_perdido'],
    dropStage: 'fechado_ganho',
    color: '#059669',
  },
];

interface KanbanBoardProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onMoveStage: (oppId: string, newStage: PipelineStage) => void;
  consultantFilter: string;
}

export function KanbanBoard({
  opportunities,
  onSelectOpportunity,
  onMoveStage,
  consultantFilter,
}: KanbanBoardProps) {
  const filteredOpportunities = opportunities.filter((opp) => {
    if (consultantFilter === 'all') return true;
    return opp.consultantId === consultantFilter;
  });

  const totalValue = filteredOpportunities.reduce(
    (total, opportunity) => total + (opportunity.proposedValue || opportunity.estimatedValue || 0),
    0
  );
  const totalWeighted = filteredOpportunities.reduce(
    (total, opportunity) => total + opportunity.weightedRevenue,
    0
  );
  const attentionCount = filteredOpportunities.filter((opportunity) =>
    isActionOverdue(opportunity.nextActionDate) || isActionToday(opportunity.nextActionDate)
  ).length;

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    onMoveStage(draggableId, destination.droppableId as PipelineStage);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, opp: Opportunity, stageId: PipelineStage) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectOpportunity(opp);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentGroupIndex = PIPELINE_GROUPS.findIndex((group) => group.stageIds.includes(stageId));
        if (currentGroupIndex < PIPELINE_GROUPS.length - 1) {
          onMoveStage(opp.id, PIPELINE_GROUPS[currentGroupIndex + 1].dropStage);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentGroupIndex = PIPELINE_GROUPS.findIndex((group) => group.stageIds.includes(stageId));
        if (currentGroupIndex > 0) {
          onMoveStage(opp.id, PIPELINE_GROUPS[currentGroupIndex - 1].dropStage);
        }
      }
    },
    [onSelectOpportunity, onMoveStage]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0757C9] dark:text-[#24C9FF]">
            Operação comercial
          </p>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Pipeline de oportunidades</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Acompanhe cada negócio até o próximo passo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <span className="mr-2 text-slate-500 dark:text-slate-400">Oportunidades</span>
            <strong className="text-slate-900 dark:text-white">{filteredOpportunities.length}</strong>
          </div>
          <div className="border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <span className="mr-2 text-slate-500 dark:text-slate-400">Pipeline</span>
            <strong className="text-slate-900 dark:text-white">{formatCurrency(totalValue)}</strong>
          </div>
          <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Forecast {formatCurrency(totalWeighted)}</span>
          </div>
          {attentionCount > 0 && (
            <div className="border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              {attentionCount} {attentionCount === 1 ? 'ação pede' : 'ações pedem'} atenção
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-6 pt-1 h-[calc(100vh-220px)] min-h-[420px] w-full max-w-full overscroll-x-contain lg:grid lg:grid-cols-6 lg:overflow-x-hidden">
        {PIPELINE_GROUPS.map((group) => {
          const stageOpps = filteredOpportunities.filter((opp) => group.stageIds.includes(opp.stage));
          const stageTotal = stageOpps.reduce(
            (acc, curr) => acc + (curr.proposedValue || curr.estimatedValue || 0),
            0
          );
          const stageWeighted = stageOpps.reduce((acc, curr) => acc + curr.weightedRevenue, 0);

          return (
            <div
              key={group.id}
              className="flex-shrink-0 w-72 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors lg:w-auto lg:min-w-0"
            >
              <div className="h-1 w-full" style={{ backgroundColor: group.color }} />
              {/* Header da Coluna */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <span
                      className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate"
                      title={group.title}
                    >
                      {group.title}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                    {stageOpps.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                  <span>{formatCurrency(stageTotal)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold" title="Forecast Ponderado">
                    {formatCurrency(stageWeighted)}
                  </span>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={group.dropStage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2.5 space-y-3 overflow-y-auto min-h-[160px] transition-colors rounded-b-2xl ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-500/10 dark:bg-blue-500/10 border-2 border-dashed border-blue-500/50'
                        : ''
                    }`}
                  >
                    {stageOpps.map((opp, index) => {
                      const isOverdue = isActionOverdue(opp.nextActionDate);
                      const isToday = isActionToday(opp.nextActionDate);

                      return (
                        <Draggable key={opp.id} draggableId={opp.id} index={index}>
                          {(providedDrag, snapshotDrag) => (
                            <div
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              onClick={() => onSelectOpportunity(opp)}
                              onKeyDown={(e) => handleKeyDown(e, opp, opp.stage)}
                              tabIndex={0}
                              role="button"
                              aria-label={`Oportunidade: ${opp.tradeName || opp.companyName}. Próxima ação: ${opp.nextActionDescription}. ${opp.activities.length} interações.`}
                              style={{
                                ...providedDrag.draggableProps.style,
                                touchAction: 'manipulation',
                              }}
                              className={`p-3.5 bg-white dark:bg-slate-800/95 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500/60 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group relative touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${
                                snapshotDrag.isDragging
                                  ? 'shadow-2xl ring-2 ring-blue-500 rotate-1 scale-105 z-50 bg-white dark:bg-slate-800'
                                  : ''
                              }`}
                            >
                              {/* Drag Handle & Score */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-1.5 flex-1 truncate">
                                  <div
                                    {...providedDrag.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded touch-none"
                                    title="Arrastar card"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 truncate">
                                    {opp.tradeName || opp.companyName}
                                  </span>
                                </div>

                                <div
                                  className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                                    opp.score >= 80
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                                      : opp.score >= 50
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                                  }`}
                                  title={`Score Nexus: ${opp.score}/100`}
                                >
                                  <Flame className="w-3.5 h-3.5" />
                                  {opp.score}
                                </div>
                              </div>

                              {/* Cidade / Segmento */}
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2.5">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                <span className="capitalize">
                                  {opp.city}/{opp.state} • {opp.segment.replace(/_/g, ' ')}
                                </span>
                              </div>

                              {/* Valores */}
                              <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2 mb-2.5">
                                <div>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-400 block uppercase font-medium">
                                    Proposta
                                  </span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                                    {formatCurrency(opp.proposedValue || opp.estimatedValue)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                                    Forecast ({opp.probability}%)
                                  </span>
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                    {formatCurrency(opp.weightedRevenue)}
                                  </span>
                                </div>
                              </div>

                              {/* Regra de Ouro: Próxima Ação */}
                              <div
                                className={`p-2.5 rounded-lg text-[11px] border transition-colors ${
                                  isOverdue
                                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
                                    : isToday
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200'
                                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                  {isOverdue ? (
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                  ) : isToday ? (
                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  )}
                                  <span className="text-[10px] uppercase tracking-wider">
                                    {isOverdue ? 'Atrasada' : isToday ? 'Hoje' : 'Próximo Passo'}
                                  </span>
                                </div>
                                <p className="line-clamp-2 text-[11px] font-medium leading-relaxed">
                                  {opp.nextActionDescription || 'Sem ação cadastrada!'}
                                </p>
                                <div className="mt-1 text-[10px] opacity-80 font-mono font-medium">
                                  {formatDateTime(opp.nextActionDate)}
                                </div>
                              </div>

                              {/* Rodapé: Consultor */}
                              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                                    {opp.consultantName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </div>
                                  <span className="truncate max-w-[110px] font-medium text-slate-700 dark:text-slate-300">
                                    {opp.consultantName.split(' ')[0]}
                                  </span>
                                </div>

                                <span className="text-[10px] text-slate-400 font-mono">
                                  {opp.activities.length} interações
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {stageOpps.length === 0 && (
                      <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-400 dark:text-slate-500 gap-1">
                        <span>Nenhuma oportunidade</span>
                        <span className="text-[10px] opacity-70">Solte um card aqui</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
