'use client';

import React, { useState, useEffect } from 'react';
import { Opportunity, Activity, Qualification } from '@/types/crm';
import { STAGES } from '@/lib/mock-data';
import { formatCurrency, formatDate, formatDateTime, isActionOverdue, isActionToday } from '@/lib/utils';
import {
  X,
  Flame,
  Building2,
  UserCircle2,
  Phone,
  Mail,
  ExternalLink,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Activity as ActivityIcon,
  Plus,
  Edit3,
  Save,
  Check,
} from 'lucide-react';

interface LeadDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (oppId: string, activity: Activity) => void;
  onUpdateQualification?: (oppId: string, qualification: Partial<Qualification>) => void;
}

export function LeadDetailModal({
  opportunity,
  isOpen,
  onClose,
  onAddActivity,
  onUpdateQualification,
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'diagnostico' | 'financeiro' | 'timeline'>('visao_geral');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [isEditingQual, setIsEditingQual] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activityType: 'reuniao' as Activity['activityType'],
    summary: '',
    resultDetails: '',
    nextAction: '',
    nextActionDate: '2026-08-16T10:00',
  });

  const [qualForm, setQualForm] = useState<Qualification>({
    mainProblem: '',
    impactedArea: '',
    currentWorkflow: '',
    currentSystems: '',
    usesSpreadsheetsManual: false,
    hasUnintegratedSystems: false,
    mainBottleneck: '',
    estimatedImpactCost: '',
    hasBudget: 'desconhecido',
    urgencyLevel: 'media',
    opportunityPotential: 'medio',
    consultantNotes: '',
  });

  useEffect(() => {
    if (opportunity?.qualification) {
      setQualForm({
        mainProblem: opportunity.qualification.mainProblem || '',
        impactedArea: opportunity.qualification.impactedArea || '',
        currentWorkflow: opportunity.qualification.currentWorkflow || '',
        currentSystems: opportunity.qualification.currentSystems || '',
        usesSpreadsheetsManual: Boolean(opportunity.qualification.usesSpreadsheetsManual),
        hasUnintegratedSystems: Boolean(opportunity.qualification.hasUnintegratedSystems),
        mainBottleneck: opportunity.qualification.mainBottleneck || '',
        estimatedImpactCost: opportunity.qualification.estimatedImpactCost || '',
        hasBudget: opportunity.qualification.hasBudget || 'desconhecido',
        urgencyLevel: opportunity.qualification.urgencyLevel || 'media',
        desiredTimeline: opportunity.qualification.desiredTimeline || '',
        competitorSupplier: opportunity.qualification.competitorSupplier || '',
        opportunityPotential: opportunity.qualification.opportunityPotential || 'medio',
        consultantNotes: opportunity.qualification.consultantNotes || '',
      });
    }
  }, [opportunity]);

  if (!isOpen || !opportunity) return null;

  const isOverdue = isActionOverdue(opportunity.nextActionDate);
  const isToday = isActionToday(opportunity.nextActionDate);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.summary || !newActivity.resultDetails) {
      alert('Por favor, preencha o resumo e o que foi conversado na atividade.');
      return;
    }

    const activity: Activity = {
      id: `act_${Date.now()}`,
      opportunityId: opportunity.id,
      consultantId: opportunity.consultantId,
      activityType: newActivity.activityType,
      summary: newActivity.summary,
      resultDetails: newActivity.resultDetails,
      performedAt: new Date().toISOString(),
      nextAction: newActivity.nextAction || opportunity.nextActionDescription,
      nextActionDate: new Date(newActivity.nextActionDate).toISOString(),
    };

    onAddActivity(opportunity.id, activity);
    setShowAddActivity(false);
    setNewActivity({
      activityType: 'reuniao',
      summary: '',
      resultDetails: '',
      nextAction: '',
      nextActionDate: '2026-08-16T10:00',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-3xl h-full shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header Fixo */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {opportunity.tradeName || opportunity.companyName}
                </h2>
                <div
                  className={`flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-md ${
                    opportunity.score >= 80
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : opportunity.score >= 50
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                  title="Score Nexus de Oportunidade"
                >
                  <Flame className="w-3.5 h-3.5" />
                  {opportunity.score} pts
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {opportunity.companyName} • {opportunity.city}/{opportunity.state} • Responsável: <strong className="text-slate-300">{opportunity.consultantName}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner de Próxima Ação no Topo */}
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
              isOverdue
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                : isToday
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                : 'bg-slate-900 border-slate-750 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isOverdue ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
              ) : isToday ? (
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="font-bold uppercase tracking-wider block text-[10px]">
                  {isOverdue ? 'Ação Atrasada' : isToday ? 'Ação Para Hoje' : 'Próxima Ação'}
                </span>
                <span className="font-medium text-slate-100">{opportunity.nextActionDescription}</span>
              </div>
            </div>
            <span className="text-[11px] font-mono shrink-0 font-bold">
              {formatDateTime(opportunity.nextActionDate)}
            </span>
          </div>

          {/* Abas */}
          <div className="flex gap-2 mt-5 border-b border-slate-800 pb-px">
            <button
              onClick={() => setActiveTab('visao_geral')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
                activeTab === 'visao_geral'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Visão Geral & Decisores
            </button>
            <button
              onClick={() => setActiveTab('diagnostico')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
                activeTab === 'diagnostico'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Diagnóstico & Qualificação
            </button>
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
                activeTab === 'financeiro'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Proposta & Financeiro
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              4. Timeline de Atividades ({opportunity.activities.length})
            </button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* ABA 1: VISÃO GERAL */}
          {activeTab === 'visao_geral' && (
            <div className="space-y-6">
              {/* Dados da Empresa */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" /> Informações Cadastrais da Empresa
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Razão Social</span>
                    <span className="font-semibold text-slate-200">{opportunity.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nome Fantasia</span>
                    <span className="font-semibold text-slate-200">{opportunity.tradeName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CNPJ</span>
                    <span className="font-mono text-slate-200">{opportunity.cnpj || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Site</span>
                    {opportunity.website ? (
                      <a href={opportunity.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300">
                        Acessar site <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-200">-</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block">Segmento</span>
                    <span className="font-semibold text-slate-200 capitalize">{opportunity.segment}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Porte / Funcionários</span>
                    <span className="font-semibold text-slate-200">
                      {opportunity.companySize.replace(/_/g, ' ')} ({opportunity.employeeCount || '-'} func.)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Origem do Lead</span>
                    <span className="font-semibold text-slate-200 capitalize">{opportunity.leadSource}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status do Pipeline</span>
                    <span className="font-semibold text-slate-200">{STAGES.find((stage) => stage.id === opportunity.stage)?.title || opportunity.stage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cadastrado em</span>
                    <span className="font-semibold text-slate-200">{formatDate(opportunity.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Matriz de Decisores */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4 text-emerald-400" /> Matriz de Interlocutores & Decisores
                </h3>
                <div className="space-y-3">
                  {opportunity.contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{c.name}</span>
                          {c.isDecisionMaker ? (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded">
                              👑 Decisor Final
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">
                              Influenciador ({c.decisionInfluence})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{c.jobTitle} • {c.area.replace(/_/g, ' ')}</p>
                      </div>

                      <div className="text-xs text-right space-y-1">
                        <div className="flex items-center gap-1.5 justify-end text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.email || '-'}</span>
                        </div>
                        {c.linkedinUrl && (
                          <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 justify-end text-blue-400 hover:text-blue-300">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: DIAGNÓSTICO & QUALIFICAÇÃO */}
          {activeTab === 'diagnostico' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Diagnóstico Comercial & Mapeamento de Dores (Nexus)
                  </h3>
                  <div className="flex items-center gap-2">
                    {!isEditingQual ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingQual(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar Diagnóstico
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (opportunity.qualification) {
                              setQualForm({
                                mainProblem: opportunity.qualification.mainProblem || '',
                                impactedArea: opportunity.qualification.impactedArea || '',
                                currentWorkflow: opportunity.qualification.currentWorkflow || '',
                                currentSystems: opportunity.qualification.currentSystems || '',
                                usesSpreadsheetsManual: Boolean(opportunity.qualification.usesSpreadsheetsManual),
                                hasUnintegratedSystems: Boolean(opportunity.qualification.hasUnintegratedSystems),
                                mainBottleneck: opportunity.qualification.mainBottleneck || '',
                                estimatedImpactCost: opportunity.qualification.estimatedImpactCost || '',
                                hasBudget: opportunity.qualification.hasBudget || 'desconhecido',
                                urgencyLevel: opportunity.qualification.urgencyLevel || 'media',
                                desiredTimeline: opportunity.qualification.desiredTimeline || '',
                                competitorSupplier: opportunity.qualification.competitorSupplier || '',
                                opportunityPotential: opportunity.qualification.opportunityPotential || 'medio',
                                consultantNotes: opportunity.qualification.consultantNotes || '',
                              });
                            }
                            setIsEditingQual(false);
                          }}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateQualification && opportunity) {
                              onUpdateQualification(opportunity.id, qualForm);
                            }
                            setIsEditingQual(false);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Salvar Diagnóstico
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!isEditingQual ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Qual é o principal problema / dor?</label>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
                        {opportunity.qualification?.mainProblem || 'Não preenchido'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Área Impactada</label>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
                          {opportunity.qualification?.impactedArea || 'Não informado'}
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Principal Gargalo Identificado</label>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
                          {opportunity.qualification?.mainBottleneck || 'Não informado'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Como funciona o processo hoje?</label>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
                        {opportunity.qualification?.currentWorkflow || 'Não informado'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Sistemas Utilizados Atualmente</label>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
                          {opportunity.qualification?.currentSystems || 'Não informado'}
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Impacto Financeiro Estimado</label>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-rose-300 font-semibold">
                          {opportunity.qualification?.estimatedImpactCost || 'Não calculado'}
                        </div>
                      </div>
                    </div>

                    {/* Badges de Qualificação */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 uppercase block">Usa Planilhas Manuais?</span>
                        <span className={`font-bold ${opportunity.qualification?.usesSpreadsheetsManual ? 'text-amber-400' : 'text-slate-400'}`}>
                          {opportunity.qualification?.usesSpreadsheetsManual ? 'SIM ⚠️' : 'NÃO'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 uppercase block">Sistemas sem Integração?</span>
                        <span className={`font-bold ${opportunity.qualification?.hasUnintegratedSystems ? 'text-rose-400' : 'text-slate-400'}`}>
                          {opportunity.qualification?.hasUnintegratedSystems ? 'SIM ⚠️' : 'NÃO'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 uppercase block">Existe Orçamento?</span>
                        <span className="font-bold text-emerald-400 capitalize">
                          {opportunity.qualification?.hasBudget?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 uppercase block">Urgência</span>
                        <span className="font-bold text-amber-400 capitalize">
                          {opportunity.qualification?.urgencyLevel?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {opportunity.qualification?.consultantNotes && (
                      <div className="pt-2">
                        <label className="text-slate-400 font-semibold block mb-1">Notas do Consultor</label>
                        <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-lg text-blue-200 italic">
                          &quot;{opportunity.qualification.consultantNotes}&quot;
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (onUpdateQualification && opportunity) {
                        onUpdateQualification(opportunity.id, qualForm);
                      }
                      setIsEditingQual(false);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Qual é o principal problema / dor?</label>
                      <textarea
                        rows={2}
                        value={qualForm.mainProblem}
                        onChange={(e) => setQualForm({ ...qualForm, mainProblem: e.target.value })}
                        placeholder="Ex: Falta de visibilidade dos gargalos comerciais..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Área Impactada</label>
                        <input
                          type="text"
                          value={qualForm.impactedArea}
                          onChange={(e) => setQualForm({ ...qualForm, impactedArea: e.target.value })}
                          placeholder="Ex: Comercial, Financeiro, Operações..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Principal Gargalo Identificado</label>
                        <input
                          type="text"
                          value={qualForm.mainBottleneck}
                          onChange={(e) => setQualForm({ ...qualForm, mainBottleneck: e.target.value })}
                          placeholder="Ex: Falta de integração entre sistemas..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Como funciona o processo hoje?</label>
                      <textarea
                        rows={2}
                        value={qualForm.currentWorkflow}
                        onChange={(e) => setQualForm({ ...qualForm, currentWorkflow: e.target.value })}
                        placeholder="Ex: Processo manual via planilhas e e-mails..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Sistemas Utilizados Atualmente</label>
                        <input
                          type="text"
                          value={qualForm.currentSystems}
                          onChange={(e) => setQualForm({ ...qualForm, currentSystems: e.target.value })}
                          placeholder="Ex: Excel, ERP Protheus, WhatsApp..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Impacto Financeiro Estimado</label>
                        <input
                          type="text"
                          value={qualForm.estimatedImpactCost || ''}
                          onChange={(e) => setQualForm({ ...qualForm, estimatedImpactCost: e.target.value })}
                          placeholder="Ex: R$ 50.000/mês em retrabalho"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Usa Planilhas?</label>
                        <select
                          value={qualForm.usesSpreadsheetsManual ? 'true' : 'false'}
                          onChange={(e) => setQualForm({ ...qualForm, usesSpreadsheetsManual: e.target.value === 'true' })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="true">SIM ⚠️</option>
                          <option value="false">NÃO</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Sem Integração?</label>
                        <select
                          value={qualForm.hasUnintegratedSystems ? 'true' : 'false'}
                          onChange={(e) => setQualForm({ ...qualForm, hasUnintegratedSystems: e.target.value === 'true' })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="true">SIM ⚠️</option>
                          <option value="false">NÃO</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Orçamento</label>
                        <select
                          value={qualForm.hasBudget}
                          onChange={(e) => setQualForm({ ...qualForm, hasBudget: e.target.value as Qualification['hasBudget'] })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="sim_confirmado">Sim Confirmado</option>
                          <option value="verba_em_definicao">Em Definição</option>
                          <option value="sem_orcamento">Sem Orçamento</option>
                          <option value="desconhecido">Desconhecido</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Urgência</label>
                        <select
                          value={qualForm.urgencyLevel}
                          onChange={(e) => setQualForm({ ...qualForm, urgencyLevel: e.target.value as Qualification['urgencyLevel'] })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="baixa">Baixa</option>
                          <option value="media">Média</option>
                          <option value="alta">Alta</option>
                          <option value="critica_imediata">Crítica / Imediata</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Notas do Consultor</label>
                      <textarea
                        rows={3}
                        value={qualForm.consultantNotes || ''}
                        onChange={(e) => setQualForm({ ...qualForm, consultantNotes: e.target.value })}
                        placeholder="Observações estratégicas da reunião de qualificação..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsEditingQual(false)}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition shadow-md shadow-blue-600/30 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Salvar Qualificação
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ABA 3: PROPOSTA & FINANCEIRO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold uppercase">Valor Proposto</span>
                  <span className="text-2xl font-black text-white">
                    {formatCurrency(opportunity.proposedValue || opportunity.estimatedValue)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Estimado inicial: {formatCurrency(opportunity.estimatedValue)}</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold uppercase">
                    Pipeline Ponderado ({opportunity.probability}%)
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {formatCurrency(opportunity.weightedRevenue)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Fórmula: Valor × Probabilidade</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold uppercase">Comissão Estimada</span>
                  <span className="text-2xl font-black text-amber-400">
                    {formatCurrency(opportunity.estimatedCommission)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Destinada a {opportunity.consultantName}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-3">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider">Detalhes do Serviço / Solução</h4>
                <div>
                  <span className="text-slate-500 block">Solução / Escopo Contratado:</span>
                  <span className="text-slate-200 font-semibold">{opportunity.solutionService}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Previsão de Fechamento:</span>
                  <span className="text-slate-200 font-mono font-semibold">{formatDate(opportunity.estimatedCloseDate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: TIMELINE DE ATIVIDADES */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Botão Registrar Nova Interação */}
              {!showAddActivity ? (
                <button
                  onClick={() => setShowAddActivity(true)}
                  className="w-full py-3 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> + Registrar Nova Interação (Ligação, Reunião, WhatsApp...)
                </button>
              ) : (
                <form
                  onSubmit={handleCreateActivity}
                  className="p-4 bg-slate-950/80 border border-blue-500/40 rounded-xl space-y-4 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Registrar Interação com o Cliente
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddActivity(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Tipo de Interação</label>
                      <select
                        value={newActivity.activityType}
                        onChange={(e) =>
                          setNewActivity({ ...newActivity, activityType: e.target.value as Activity['activityType'] })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="reuniao">Reunião (Call / Presencial)</option>
                        <option value="whatsapp">WhatsApp / Mensagem</option>
                        <option value="ligacao">Ligação Telefônica</option>
                        <option value="email">E-mail</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Resumo / Assunto</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Call de alinhamento com Diretor"
                        value={newActivity.summary}
                        onChange={(e) => setNewActivity({ ...newActivity, summary: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      O que foi conversado / decidido?
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detalhes dos pontos abordados e reações do cliente..."
                      value={newActivity.resultDetails}
                      onChange={(e) => setNewActivity({ ...newActivity, resultDetails: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg space-y-3">
                    <span className="text-[11px] font-bold text-amber-300 block uppercase">
                      📌 Obrigatório: Agendar a Próxima Ação
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Próximo Passo</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Enviar proposta revisada"
                          value={newActivity.nextAction}
                          onChange={(e) => setNewActivity({ ...newActivity, nextAction: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Data & Hora</label>
                        <input
                          type="datetime-local"
                          required
                          value={newActivity.nextActionDate}
                          onChange={(e) =>
                            setNewActivity({ ...newActivity, nextActionDate: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition shadow-md shadow-blue-600/30"
                  >
                    Salvar Interação & Atualizar Pipeline
                  </button>
                </form>
              )}

              {/* Feed Cronológico */}
              <div className="relative border-l border-slate-800 ml-4 space-y-6">
                {opportunity.activities.map((act) => (
                  <div key={act.id} className="relative pl-6">
                    <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-slate-900 border border-blue-500 flex items-center justify-center text-blue-400 text-[10px]">
                      <ActivityIcon className="w-3 h-3" />
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{act.summary}</span>
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] uppercase font-semibold">
                            {act.activityType}
                          </span>
                        </div>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {formatDateTime(act.performedAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 whitespace-pre-wrap">{act.resultDetails}</p>

                      {act.nextAction && (
                        <div className="text-[11px] text-amber-300/90 pt-2 border-t border-slate-850 flex items-center gap-1.5 font-medium">
                          <span>➡️ Próximo passo definido: {act.nextAction}</span>
                          <span className="font-mono opacity-75">({formatDateTime(act.nextActionDate)})</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
