'use client';

import React, { useState } from 'react';
import { Opportunity, Segment, CompanySize, LeadSource, DecisionInfluence, ContactArea } from '@/types/crm';
import { calculateOpportunityScore } from '@/lib/mock-data';
import { useAuth } from '@/lib/supabase/auth-context';
import { X, Sparkles, AlertCircle, Building2, UserCircle2, Flame } from 'lucide-react';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newOpp: Partial<Opportunity>) => void;
}

function getDefaultNextActionDate(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

interface FormData {
  companyName: string;
  tradeName: string;
  cnpj: string;
  segment: Segment;
  state: string;
  city: string;
  companySize: CompanySize;
  leadSource: LeadSource;
  contactName: string;
  contactJobTitle: string;
  contactPhone: string;
  contactEmail: string;
  isDecisionMaker: boolean;
  decisionInfluence: DecisionInfluence;
  mainProblem: string;
  estimatedValue: number;
  nextActionDescription: string;
  nextActionDate: string;
}

export function QuickCaptureModal({ isOpen, onClose, onSave }: QuickCaptureModalProps) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<FormData>(() => ({
    companyName: '',
    tradeName: '',
    cnpj: '',
    segment: 'industria',
    state: 'SP',
    city: '',
    companySize: 'media_50_199',
    leadSource: 'linkedin',
    contactName: '',
    contactJobTitle: '',
    contactPhone: '',
    contactEmail: '',
    isDecisionMaker: true,
    decisionInfluence: 'alta',
    mainProblem: '',
    estimatedValue: 35000,
    nextActionDescription: 'Enviar mensagem de introdução e agendar Pré-Diagnóstico',
    nextActionDate: getDefaultNextActionDate(),
  }));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName || !formData.nextActionDescription || !formData.nextActionDate) {
      alert('Por favor, preencha todos os campos obrigatórios (Empresa, Contato e Próxima Ação).');
      return;
    }

    const consultantId = profile?.id || 'usr_tiago';
    const consultantName = profile?.name || 'Tiago Santos';
    const commissionRate = profile?.commissionRate || 10;

    const newOpp: Partial<Opportunity> = {
      id: `opp_${Date.now()}`,
      companyName: formData.companyName,
      tradeName: formData.tradeName || formData.companyName,
      cnpj: formData.cnpj,
      segment: formData.segment,
      state: formData.state,
      city: formData.city || 'São Paulo',
      companySize: formData.companySize,
      leadSource: formData.leadSource,
      consultantId,
      consultantName,
      title: `Diagnóstico & Soluções - ${formData.tradeName || formData.companyName}`,
      stage: 'lead_identificado',
      solutionService: 'Diagnóstico Comercial e Operacional Nexus',
      estimatedValue: Number(formData.estimatedValue) || 30000,
      proposedValue: Number(formData.estimatedValue) || 30000,
      probability: 5,
      weightedRevenue: (Number(formData.estimatedValue) || 30000) * 0.05,
      estimatedCommission: (Number(formData.estimatedValue) || 30000) * (commissionRate / 100),
      estimatedCloseDate: '2026-09-30',
      nextActionDescription: formData.nextActionDescription,
      nextActionDate: new Date(formData.nextActionDate).toISOString(),
      contacts: [
        {
          id: `cnt_${Date.now()}`,
          companyId: `opp_${Date.now()}`,
          name: formData.contactName,
          jobTitle: formData.contactJobTitle || 'Gestor',
          area: 'diretoria_clevel' as ContactArea,
          phone: formData.contactPhone,
          email: formData.contactEmail,
          isDecisionMaker: formData.isDecisionMaker,
          decisionInfluence: formData.decisionInfluence,
        },
      ],
      qualification: {
        mainProblem: formData.mainProblem || 'Ainda em mapeamento inicial',
        impactedArea: 'Geral',
        currentWorkflow: '',
        currentSystems: '',
        usesSpreadsheetsManual: false,
        hasUnintegratedSystems: false,
        mainBottleneck: '',
        hasBudget: 'desconhecido',
        urgencyLevel: 'media',
        opportunityPotential: 'medio',
      },
      activities: [
        {
          id: `act_${Date.now()}`,
          opportunityId: `opp_${Date.now()}`,
          consultantId,
          activityType: 'linkedin',
          summary: 'Cadastro Inicial do Lead',
          resultDetails: 'Oportunidade identificada e cadastrada no pipeline Nexus.',
          performedAt: new Date().toISOString(),
          nextAction: formData.nextActionDescription,
          nextActionDate: new Date(formData.nextActionDate).toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newOpp.score = calculateOpportunityScore(newOpp);
    onSave(newOpp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quick Capture: Novo Lead Nexus</h2>
              <p className="text-xs text-slate-400">Cadastro rápido em menos de 1 minuto para consultores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Seção 1: Empresa */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
              <Building2 className="w-4 h-4" /> 1. Dados da Empresa
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Razão Social / Nome da Empresa <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Indústria MetalAlfa S.A."
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  placeholder="Ex: MetalAlfa"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Segmento</label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="industria">Indústria / Manufatura</option>
                  <option value="logistica">Logística & Transportes</option>
                  <option value="varejo_ecom">Varejo & E-commerce</option>
                  <option value="servicos">Serviços B2B</option>
                  <option value="tecnologia">Tecnologia / SaaS</option>
                  <option value="saude">Saúde & Clínicas</option>
                  <option value="construcao">Construção Civil</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="Campinas"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="SP"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Origem do Lead</label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="indicacao">Indicação</option>
                  <option value="outbound">Outbound / Cold Call</option>
                  <option value="evento">Evento / Feira</option>
                  <option value="site">Site Nexus</option>
                  <option value="pre_diagnostico">Pré-Diagnóstico Online</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Consultor Responsável</label>
                <div className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4 text-blue-400" />
                  <span>{profile?.name || 'Tiago Santos'}</span>
                  {profile?.role === 'admin_ceo' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold">CEO</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Contato Principal */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <UserCircle2 className="w-4 h-4" /> 2. Contato / Interlocutor
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Nome do Contato <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marcos Silveira"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Cargo</label>
                <input
                  type="text"
                  placeholder="Ex: Diretor de Operações"
                  value={formData.contactJobTitle}
                  onChange={(e) => setFormData({ ...formData, contactJobTitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 99999-8888"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="marcos@metalalfa.com.br"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Dor & Próxima Ação Obrigatória */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              <AlertCircle className="w-4 h-4" /> 3. Dor Percebida & Regra de Ouro (Próxima Ação)
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Dor Inicial Percebida</label>
                <input
                  type="text"
                  placeholder="Ex: Estoque desatualizado, falta de indicadores de PCP, muitos processos no papel..."
                  value={formData.mainProblem}
                  onChange={(e) => setFormData({ ...formData, mainProblem: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>📌 Regra Nexus: Nenhuma oportunidade sem próximo passo!</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Descrição da Próxima Ação <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ligar na terça às 10h para marcar o Pré-Diagnóstico"
                      value={formData.nextActionDescription}
                      onChange={(e) => setFormData({ ...formData, nextActionDescription: e.target.value })}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Data & Hora <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.nextActionDate}
                      onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              Criar Oportunidade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
