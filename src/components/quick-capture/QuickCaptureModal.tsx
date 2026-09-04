'use client';

import React, { useState } from 'react';
import { Opportunity, Segment, CompanySize, LeadSource, DecisionInfluence, ContactArea, PipelineStage } from '@/types/crm';
import { calculateOpportunityScore } from '@/lib/mock-data';
import { useAuth } from '@/lib/supabase/auth-context';
import { X, Sparkles, AlertCircle, Building2, UserCircle2, Flame, Search, Loader2, Globe2, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

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
  website: string;
  segment: Segment;
  state: string;
  city: string;
  companySize: CompanySize;
  leadSource: LeadSource;
  stage: PipelineStage;
  contactName: string;
  contactJobTitle: string;
  contactPhone: string;
  contactEmail: string;
  linkedinUrl: string;
  contactArea: ContactArea;
  isDecisionMaker: boolean;
  decisionInfluence: DecisionInfluence;
  mainProblem: string;
  estimatedValue: number;
  consultantNotes: string;
  nextActionDescription: string;
  nextActionDate: string;
}

export function QuickCaptureModal({ isOpen, onClose, onSave }: QuickCaptureModalProps) {
  const { profile } = useAuth();
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => ({
    companyName: '',
    tradeName: '',
    cnpj: '',
    website: '',
    segment: 'industria',
    state: 'SP',
    city: '',
    companySize: 'media_50_199',
    leadSource: 'linkedin',
    stage: 'lead_identificado',
    contactName: '',
    contactJobTitle: '',
    contactPhone: '',
    contactEmail: '',
    linkedinUrl: '',
    contactArea: 'diretoria_clevel',
    isDecisionMaker: true,
    decisionInfluence: 'alta',
    mainProblem: '',
    estimatedValue: 35000,
    consultantNotes: '',
    nextActionDescription: 'Enviar mensagem de introdução e agendar Pré-Diagnóstico',
    nextActionDate: getDefaultNextActionDate(),
  }));

  const handleSearchCnpj = async () => {
    const clean = formData.cnpj.replace(/\D/g, '');
    if (!clean && !formData.companyName) {
      toast.error('Digite um CNPJ ou Razão Social para buscar');
      return;
    }

    setIsSearchingCnpj(true);
    try {
      const res = await fetch('/api/lead-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: clean,
          companyName: formData.companyName,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const d = json.data;
        const dossier = json.dossier;
        const mainPartner = dossier?.socios?.[0];

        setFormData((prev) => ({
          ...prev,
          companyName: d.razao_social || prev.companyName,
          tradeName: d.nome_fantasia || d.razao_social || prev.tradeName,
          cnpj: d.cnpj || prev.cnpj,
          city: d.municipio || prev.city,
          state: d.uf || prev.state,
          contactPhone: dossier?.contatos_oficiais?.telefone_principal || d.ddd_telefone_1 || prev.contactPhone,
          contactEmail: dossier?.contatos_oficiais?.email || d.email || prev.contactEmail,
          contactName: mainPartner?.nome_socio || prev.contactName,
          contactJobTitle: mainPartner?.qualificacao_socio || prev.contactJobTitle || 'Sócio-Administrador',
          mainProblem: dossier?.gancho_de_abordagem || prev.mainProblem,
        }));
        toast.success(`Dados de ${d.nome_fantasia || d.razao_social} e contatos preenchidos automaticamente!`);
      } else {
        toast.error(json.error || 'Empresa não encontrada na Receita');
      }
    } catch {
      toast.error('Erro na consulta pública do CNPJ');
    } finally {
      setIsSearchingCnpj(false);
    }
  };

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
      website: formData.website,
      segment: formData.segment,
      state: formData.state,
      city: formData.city || 'São Paulo',
      companySize: formData.companySize,
      leadSource: formData.leadSource,
      consultantId,
      consultantName,
      title: `Diagnóstico & Soluções - ${formData.tradeName || formData.companyName}`,
      stage: formData.stage,
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
          phone: formData.contactPhone,
          email: formData.contactEmail,
          linkedinUrl: formData.linkedinUrl,
          area: formData.contactArea,
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
        consultantNotes: formData.consultantNotes,
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
          {/* Consulta Rápida de CNPJ / Receita Federal */}
          <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" /> Preenchimento Automático via CNPJ / Receita
              </label>
              <span className="text-[10px] text-blue-300/70 font-medium">BrasilAPI • 100% Grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Digite o CNPJ da empresa (ex: 42.158.963/0001-52)..."
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchCnpj();
                    }
                  }}
                  className="w-full bg-slate-900 border border-blue-900/60 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchCnpj}
                disabled={isSearchingCnpj}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSearchingCnpj ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar Dados</span>
                  </>
                )}
              </button>
            </div>
          </div>

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
                <label className="block text-xs text-slate-300 font-medium mb-1">Site</label>
                <input
                  type="url"
                  placeholder="https://empresa.com.br"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Segmento</label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value as Segment })}
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
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value as LeadSource })}
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
                <label className="block text-xs text-slate-300 font-medium mb-1">Porte da Empresa</label>
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value as CompanySize })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="micro_1_9">MEI / Microempresa</option>
                  <option value="pequena_10_49">Pequena</option>
                  <option value="media_50_199">Média</option>
                  <option value="grande_200_mais">Grande</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Consultor Responsável</label>
                <div className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4 text-blue-400" />
                  <span>{profile?.name || 'Tiago Santos'}</span>
                  {(profile?.role === 'admin_ceo' || profile?.role === 'admin_tech') && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold">
                      {profile?.role === 'admin_ceo' ? 'CEO' : 'ADMIN'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Status do Pipeline</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as PipelineStage })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="lead_identificado">Prospecção</option>
                  <option value="pre_diag_agendado">Reunião Agendada</option>
                  <option value="proposta_enviada">Proposta Enviada</option>
                  <option value="negociacao">Negociação</option>
                  <option value="fechado_ganho">Fechado Ganho</option>
                  <option value="fechado_perdido">Fechado Perdido</option>
                </select>
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

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">LinkedIn</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/contato"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Área</label>
                <select
                  value={formData.contactArea}
                  onChange={(e) => setFormData({ ...formData, contactArea: e.target.value as ContactArea })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="diretoria_clevel">Diretoria / C-Level</option>
                  <option value="comercial">Comercial</option>
                  <option value="operacoes">Operações</option>
                  <option value="ti_sistemas">TI / Sistemas</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="rh">RH</option>
                  <option value="outro">Outra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">É decisor?</label>
                <select
                  value={formData.isDecisionMaker ? 'sim' : 'nao'}
                  onChange={(e) => setFormData({ ...formData, isDecisionMaker: e.target.value === 'sim' })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Influência na decisão</label>
                <select
                  value={formData.decisionInfluence}
                  onChange={(e) => setFormData({ ...formData, decisionInfluence: e.target.value as DecisionInfluence })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
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

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Investimento estimado</label>
                <select
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="10000">Até R$ 10.000</option>
                  <option value="50000">Até R$ 50.000</option>
                  <option value="100000">Até R$ 100.000</option>
                  <option value="250000">Até R$ 250.000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Observações do consultor</label>
                <textarea
                  rows={3}
                  placeholder="Contexto, necessidades e informações relevantes..."
                  value={formData.consultantNotes}
                  onChange={(e) => setFormData({ ...formData, consultantNotes: e.target.value })}
                  className="w-full resize-y bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Regra Nexus: nenhuma oportunidade sem próximo passo</span>
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
