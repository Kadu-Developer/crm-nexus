import { PipelineStage, StageDefinition, StageMacroPhase, Opportunity, User } from '@/types/crm';

export const USERS: User[] = [
  {
    id: '53bac6e7-3f19-4a5c-a88f-d0823f8b1ee9',
    name: 'Marcel Wachowicz',
    email: 'marcel@nexusflowtech.com.br',
    role: 'admin_ceo',
    avatar: 'MW',
    commissionRate: 0,
  },
  {
    id: '7a626ae3-260a-4112-bf12-672a7819ca98',
    name: 'Carlos Eduardo da Silva Ribeiro',
    email: 'carlos@nexusflowtech.com.br',
    role: 'admin_tech',
    avatar: 'CR',
    commissionRate: 0,
  },
  {
    id: 'd4ec4f37-9d6d-4e0b-8154-760eb52ed669',
    name: 'Patrik Rodrigues',
    email: 'patrik@nexusflowtech.com.br',
    role: 'admin_tech',
    avatar: 'PR',
    commissionRate: 0,
  },
  {
    id: 'f5ec8799-615c-40d8-8795-d63d49ef9a97',
    name: 'Thiago Mendes',
    email: 'thiago.consultor@nexusflowtech.com.br',
    role: 'consultant',
    avatar: 'TM',
    commissionRate: 10,
  },
  {
    id: '1c735ff8-44ad-474b-a991-b7378e90a255',
    name: 'Larissa Santos',
    email: 'larissa.consultora@nexusflowtech.com.br',
    role: 'consultant',
    avatar: 'LS',
    commissionRate: 10,
  },
  {
    id: '31ef62be-800c-45b2-9fff-d2b67386e47e',
    name: 'Bruno Carvalho',
    email: 'bruno.consultor@nexusflowtech.com.br',
    role: 'consultant',
    avatar: 'BC',
    commissionRate: 10,
  },
  {
    id: '4c7a1a15-9807-4abe-8562-7012f52e8304',
    name: 'Consultor Teste',
    email: 'consultor.teste@nexusflowtech.com.br',
    role: 'consultant',
    avatar: 'CT',
    commissionRate: 10,
  },
];

export const STAGES: StageDefinition[] = [
  { id: 'lead_identificado', title: '1. Lead Identificado', shortTitle: 'Identificado', phase: 'prospeccao', defaultProbability: 5, color: '#64748b' },
  { id: 'primeiro_contato', title: '2. Primeiro Contato', shortTitle: '1º Contato', phase: 'prospeccao', defaultProbability: 10, color: '#0284c7' },
  { id: 'contato_realizado', title: '3. Contato Realizado', shortTitle: 'Realizado', phase: 'prospeccao', defaultProbability: 15, color: '#0ea5e9' },
  
  { id: 'pre_diag_agendado', title: '4. Pré-Diag. Agendado', shortTitle: 'Pré-Diag Agend.', phase: 'diagnostico', defaultProbability: 25, color: '#8b5cf6' },
  { id: 'pre_diag_realizado', title: '5. Pré-Diag. Realizado', shortTitle: 'Pré-Diag Realiz.', phase: 'diagnostico', defaultProbability: 35, color: '#a855f7' },
  { id: 'qualificado', title: '6. Qualificado', shortTitle: 'Qualificado', phase: 'diagnostico', defaultProbability: 45, color: '#d946ef' },
  { id: 'diag_proposto', title: '7. Diag. Proposto', shortTitle: 'Diag. Proposto', phase: 'diagnostico', defaultProbability: 55, color: '#ec4899' },
  { id: 'diag_contratado', title: '8. Diag. Contratado', shortTitle: 'Diag. Contratado', phase: 'diagnostico', defaultProbability: 70, color: '#f43f5e' },
  { id: 'diag_realizado', title: '9. Diag. Realizado', shortTitle: 'Diag. Realizado', phase: 'diagnostico', defaultProbability: 80, color: '#f97316' },

  { id: 'solucao_identificada', title: '10. Projeto Identificado', shortTitle: 'Projeto Ident.', phase: 'solucao', defaultProbability: 85, color: '#eab308' },
  { id: 'proposta_enviada', title: '11. Proposta Enviada', shortTitle: 'Proposta Enviada', phase: 'solucao', defaultProbability: 90, color: '#84cc16' },
  { id: 'negociacao', title: '12. Negociação Final', shortTitle: 'Negociação', phase: 'solucao', defaultProbability: 95, color: '#10b981' },

  { id: 'fechado_ganho', title: '13. Fechado Ganho 🏆', shortTitle: 'Ganho', phase: 'conclusao', defaultProbability: 100, color: '#059669' },
  { id: 'fechado_perdido', title: '14. Fechado Perdido ❌', shortTitle: 'Perdido', phase: 'conclusao', defaultProbability: 0, color: '#dc2626' },
];

export const MACRO_PHASES: { id: StageMacroPhase; title: string; countBadge: string }[] = [
  { id: 'prospeccao', title: 'Prospecção & Contato', countBadge: 'Fase 1' },
  { id: 'diagnostico', title: 'Diagnóstico Nexus', countBadge: 'Fase 2' },
  { id: 'solucao', title: 'Solução & Proposta', countBadge: 'Fase 3' },
  { id: 'conclusao', title: 'Conclusão', countBadge: 'Fase 4' },
];

export function calculateOpportunityScore(opp: Partial<Opportunity>): number {
  let score = 0;
  
  // 1. Dor e gargalo mapeados (máx 25 pts)
  const q = opp.qualification;
  if (q) {
    if (q.mainProblem && q.mainProblem.trim().length > 10) score += 10;
    if (q.mainBottleneck && q.mainBottleneck.trim().length > 5) score += 5;
    if (q.usesSpreadsheetsManual) score += 5;
    if (q.hasUnintegratedSystems) score += 5;
    
    // 2. Orçamento (máx 20 pts)
    if (q.hasBudget === 'sim_confirmado') score += 20;
    else if (q.hasBudget === 'verba_em_definicao') score += 10;
    else if (q.hasBudget === 'desconhecido') score += 5;
    
    // 3. Urgência (máx 15 pts)
    if (q.urgencyLevel === 'critica_imediata') score += 15;
    else if (q.urgencyLevel === 'alta') score += 12;
    else if (q.urgencyLevel === 'media') score += 6;
  }
  
  // 4. Decisor no contato (máx 20 pts)
  const hasDecisionMaker = opp.contacts?.some(c => c.isDecisionMaker && c.decisionInfluence === 'alta');
  const hasPartialDecision = opp.contacts?.some(c => c.isDecisionMaker || c.decisionInfluence === 'media');
  if (hasDecisionMaker) score += 20;
  else if (hasPartialDecision) score += 12;
  else if (opp.contacts && opp.contacts.length > 0) score += 4;
  
  // 5. Aderência ICP (máx 10 pts)
  if (opp.companySize === 'media_50_199' || opp.companySize === 'grande_200_mais') score += 6;
  else if (opp.companySize === 'pequena_10_49') score += 4;
  
  if (opp.segment === 'industria' || opp.segment === 'tecnologia' || opp.segment === 'logistica' || opp.segment === 'servicos') {
    score += 4;
  }
  
  // 6. Próximo passo agendado (máx 10 pts)
  if (opp.nextActionDescription && opp.nextActionDate) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_metalalfa',
    companyName: 'MetalAlfa Indústria Metalúrgica Ltda',
    tradeName: 'MetalAlfa',
    title: 'Automação de Apontamento e Chão de Fábrica',
    solutionService: 'Diagnóstico & Automação Industrial',
    cnpj: '42.158.963/0001-52',
    segment: 'industria',
    city: 'Campinas',
    state: 'SP',
    companySize: 'media_50_199',
    leadSource: 'linkedin',
    stage: 'pre_diag_agendado',
    probability: 25,
    estimatedValue: 45000,
    proposedValue: 45000,
    weightedRevenue: 11250,
    estimatedCommission: 4500,
    estimatedCloseDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    consultantId: 'usr_consultor_teste',
    consultantName: 'Consultor Teste',
    score: 85,
    nextActionDescription: 'Realizar Reunião de Pré-Diagnóstico com Diretor de Operações',
    nextActionDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    contacts: [
      {
        id: 'cont_1',
        companyId: 'opp_metalalfa',
        name: 'Carlos Eduardo Mendes',
        jobTitle: 'Sócio-Administrador',
        area: 'diretoria_clevel',
        email: 'carlos@metalalfa.com.br',
        phone: '(11) 98765-4321',
        isDecisionMaker: true,
        decisionInfluence: 'alta',
      },
    ],
    qualification: {
      mainProblem: 'Controle de chão de fábrica descentralizado em planilhas',
      impactedArea: 'Operações e Logística',
      currentWorkflow: 'Apontamentos físicos em papel consolidados semanalmente em Excel',
      currentSystems: 'ERP legado sem módulo de chão de fábrica',
      mainBottleneck: 'Falta de integração entre apontamento de produção e estoque',
      hasBudget: 'sim_confirmado',
      urgencyLevel: 'alta',
      opportunityPotential: 'alto',
      usesSpreadsheetsManual: true,
      hasUnintegratedSystems: true,
    },
    activities: [
      {
        id: 'act_1',
        opportunityId: 'opp_metalalfa',
        consultantId: 'usr_consultor_teste',
        activityType: 'whatsapp',
        performedAt: new Date().toISOString(),
        summary: 'Abordagem consultiva via WhatsApp',
        resultDetails: 'Decisor confirmou interesse no Pré-Diagnóstico Técnico.',
        nextAction: 'Reunião de Diagnóstico',
        nextActionDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'opp_techlog',
    companyName: 'TechLog Express Transportes S.A.',
    tradeName: 'TechLog Express',
    title: 'Integração de Frotas e Eliminação de Comprovantes Manuais',
    solutionService: 'Automação Logística & APIs',
    cnpj: '18.234.567/0001-89',
    segment: 'logistica',
    city: 'São Paulo',
    state: 'SP',
    companySize: 'grande_200_mais',
    leadSource: 'outbound',
    stage: 'lead_identificado',
    probability: 5,
    estimatedValue: 75000,
    proposedValue: 75000,
    weightedRevenue: 3750,
    estimatedCommission: 7500,
    estimatedCloseDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
    consultantId: 'usr_consultor_teste',
    consultantName: 'Consultor Teste',
    score: 68,
    nextActionDescription: 'Disparar abordagem consultiva para o Diretor de Logística',
    nextActionDate: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contacts: [
      {
        id: 'cont_2',
        companyId: 'opp_techlog',
        name: 'Roberto Viana',
        jobTitle: 'Diretor de Logística',
        area: 'operacoes',
        email: 'roberto@techlog.com.br',
        phone: '(11) 3456-7890',
        isDecisionMaker: true,
        decisionInfluence: 'alta',
      },
    ],
    qualification: {
      mainProblem: 'Dificuldade de rastreamento em tempo real de frotas terceirizadas',
      impactedArea: 'Logística & SAC',
      currentWorkflow: 'Planilhas enviadas por WhatsApp pelos motoristas parceiros',
      currentSystems: 'TMS interno sem API de integração',
      mainBottleneck: 'Processos manuais de checagem de comprovantes de entrega',
      hasBudget: 'verba_em_definicao',
      urgencyLevel: 'media',
      opportunityPotential: 'alto',
      usesSpreadsheetsManual: true,
      hasUnintegratedSystems: true,
    },
    activities: [],
  },
];
