import { PipelineStage, StageDefinition, StageMacroPhase, Opportunity, User } from '@/types/crm';

export const USERS: User[] = [
  {
    id: 'usr_carlos',
    name: 'Carlos Eduardo',
    email: 'carlos@nexustechflow.com.br',
    role: 'admin_ceo',
    avatar: 'CE',
    commissionRate: 0,
  },
  {
    id: 'usr_tiago',
    name: 'Tiago Santos',
    email: 'tiago@nexus.com.br',
    role: 'consultant',
    avatar: 'TS',
    commissionRate: 10,
  },
  {
    id: 'usr_ana',
    name: 'Ana Ribeiro',
    email: 'ana@nexus.com.br',
    role: 'consultant',
    avatar: 'AR',
    commissionRate: 10,
  },
  {
    id: 'usr_ceo',
    name: 'Diretoria Executiva',
    email: 'diretoria@nexus.com.br',
    role: 'admin_ceo',
    avatar: 'CEO',
    commissionRate: 0,
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
  
  // 6. Engajamento / Atividades (máx 10 pts)
  if (opp.activities && opp.activities.length >= 2) score += 10;
  else if (opp.activities && opp.activities.length === 1) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_1',
    companyName: 'LogiTrans Logística e Transportes S.A.',
    tradeName: 'LogiTrans Brasil',
    cnpj: '12.345.678/0001-90',
    website: 'https://logitrans.com.br',
    segment: 'logistica',
    state: 'SP',
    city: 'Campinas',
    companySize: 'media_50_199',
    employeeCount: 140,
    estimatedRevenueTier: '15m_a_50m',
    leadSource: 'linkedin',
    consultantId: 'usr_tiago',
    consultantName: 'Tiago Santos',
    title: 'Diagnóstico Operacional & Integração WMS/ERP',
    stage: 'pre_diag_realizado',
    solutionService: 'Diagnóstico de Processos + Integração de Sistemas',
    estimatedValue: 45000,
    proposedValue: 48000,
    probability: 35,
    weightedRevenue: 16800,
    estimatedCommission: 4800,
    estimatedCloseDate: '2026-09-30',
    score: 85,
    nextActionDescription: 'Apresentar relatório executivo do Pré-Diagnóstico para o Diretor de Operações',
    nextActionDate: '2026-08-16T14:30:00Z',
    contacts: [
      {
        id: 'cnt_1',
        companyId: 'opp_1',
        name: 'Roberto Viana',
        jobTitle: 'Diretor de Operações (COO)',
        area: 'operacoes',
        phone: '(19) 98765-4321',
        email: 'roberto.viana@logitrans.com.br',
        linkedinUrl: 'https://linkedin.com/in/robertoviana',
        isDecisionMaker: true,
        decisionInfluence: 'alta',
      },
      {
        id: 'cnt_2',
        companyId: 'opp_1',
        name: 'Mariana Duarte',
        jobTitle: 'Coordenadora de TI',
        area: 'ti_sistemas',
        phone: '(19) 98123-9988',
        email: 'mariana.ti@logitrans.com.br',
        isDecisionMaker: false,
        decisionInfluence: 'media',
      },
    ],
    qualification: {
      mainProblem: 'Falta de visibilidade do estoque em tempo real e retrabalho manual diário entre WMS e ERP Totvs.',
      impactedArea: 'Operações e Logística',
      currentWorkflow: 'Operadores exportam planilhas do WMS 3x ao dia e digitam manualmente no ERP. Alto índice de erros.',
      currentSystems: 'Totvs Protheus, WMS proprietário antigo, Excel',
      usesSpreadsheetsManual: true,
      hasUnintegratedSystems: true,
      mainBottleneck: 'Fechamento de expedição demora 4 horas além do expediente normal.',
      estimatedImpactCost: 'R$ 35.000/mês em horas extras e perdas por divergência de carga.',
      hasBudget: 'sim_confirmado',
      urgencyLevel: 'alta',
      desiredTimeline: 'Q4 2026',
      competitorSupplier: 'Nenhum atualmente (tentaram consultoria interna sem sucesso)',
      opportunityPotential: 'alto',
      consultantNotes: 'Cliente muito receptivo. O COO reconheceu que o gargalo está impedindo a expansão de novos centros de distribuição.',
    },
    activities: [
      {
        id: 'act_1',
        opportunityId: 'opp_1',
        consultantId: 'usr_tiago',
        activityType: 'reuniao',
        summary: 'Sessão de Pré-Diagnóstico (1h30)',
        resultDetails: 'Mapeamos o fluxo da carga e o gap de integração WMS-ERP. Identificada dor crítica na conferência.',
        performedAt: '2026-08-14T10:00:00Z',
        nextAction: 'Apresentar relatório executivo do Pré-Diagnóstico para o Diretor de Operações',
        nextActionDate: '2026-08-16T14:30:00Z',
      },
      {
        id: 'act_2',
        opportunityId: 'opp_1',
        consultantId: 'usr_tiago',
        activityType: 'linkedin',
        summary: 'Primeiro contato via InMail',
        resultDetails: 'Roberto respondeu com interesse em rever processos antes da Black Friday.',
        performedAt: '2026-08-08T09:00:00Z',
        nextAction: 'Agendar call de alinhamento',
        nextActionDate: '2026-08-11T10:00:00Z',
      },
    ],
    createdAt: '2026-08-08T09:00:00Z',
    updatedAt: '2026-08-14T11:00:00Z',
  },
  {
    id: 'opp_2',
    companyName: 'Metalúrgica InoxForge Ltda',
    tradeName: 'InoxForge',
    cnpj: '98.765.432/0001-11',
    segment: 'industria',
    state: 'MG',
    city: 'Contagem',
    companySize: 'grande_200_mais',
    employeeCount: 320,
    estimatedRevenueTier: 'acima_50m',
    leadSource: 'indicacao',
    consultantId: 'usr_ana',
    consultantName: 'Ana Ribeiro',
    title: 'Diagnóstico Completo de Eficiência Fabril & PCP',
    stage: 'diag_proposto',
    solutionService: 'Diagnóstico Nexus Deep Dive PCP + OEE',
    estimatedValue: 65000,
    proposedValue: 62000,
    probability: 55,
    weightedRevenue: 34100,
    estimatedCommission: 6200,
    estimatedCloseDate: '2026-09-15',
    score: 92,
    nextActionDescription: 'Follow-up da proposta de diagnóstico com o Diretor Industrial (Sr. Carlos)',
    nextActionDate: '2026-08-15T10:00:00Z',
    contacts: [
      {
        id: 'cnt_3',
        companyId: 'opp_2',
        name: 'Carlos Drummond',
        jobTitle: 'Diretor Industrial',
        area: 'diretoria_clevel',
        phone: '(31) 99888-1122',
        email: 'carlos.drummond@inoxforge.com.br',
        isDecisionMaker: true,
        decisionInfluence: 'alta',
      },
    ],
    qualification: {
      mainProblem: 'Paradas não planejadas de linha e falta de acurácia no apontamento de refugo.',
      impactedArea: 'Chão de fábrica e PCP',
      currentWorkflow: 'Apontamento em fichas de papel preenchidas pelos operadores ao final do turno.',
      currentSystems: 'SAP ECC, planilhas de controle de qualidade',
      usesSpreadsheetsManual: true,
      hasUnintegratedSystems: true,
      mainBottleneck: 'Descobrem que o lote está defeituoso somente 2 dias após a fundição.',
      estimatedImpactCost: 'R$ 80.000/mês em refugo e retrabalho.',
      hasBudget: 'sim_confirmado',
      urgencyLevel: 'critica_imediata',
      desiredTimeline: 'Início imediato em Setembro',
      opportunityPotential: 'alto',
      consultantNotes: 'Diretoria já aprovou a contratação de consultoria externa. Concorrente local ofereceu escopo fraco.',
    },
    activities: [
      {
        id: 'act_3',
        opportunityId: 'opp_2',
        consultantId: 'usr_ana',
        activityType: 'email',
        summary: 'Envio da Proposta Comercial de Diagnóstico',
        resultDetails: 'Proposta enviada no valor de R$ 62k com cronograma de 4 semanas.',
        performedAt: '2026-08-12T16:00:00Z',
        nextAction: 'Follow-up da proposta com o Diretor Industrial',
        nextActionDate: '2026-08-15T10:00:00Z',
      },
    ],
    createdAt: '2026-08-01T14:00:00Z',
    updatedAt: '2026-08-12T16:00:00Z',
  },
  {
    id: 'opp_3',
    companyName: 'ClinSaúde Diagnósticos Médicos',
    tradeName: 'Rede ClinSaúde',
    cnpj: '44.555.666/0001-22',
    segment: 'saude',
    state: 'RJ',
    city: 'Rio de Janeiro',
    companySize: 'pequena_10_49',
    employeeCount: 45,
    estimatedRevenueTier: '4_8m_a_15m',
    leadSource: 'outbound',
    consultantId: 'usr_tiago',
    consultantName: 'Tiago Santos',
    title: 'Otimização da Jornada de Agendamento & Atendimento',
    stage: 'primeiro_contato',
    solutionService: 'Diagnóstico Comercial e CRM de Atendimento',
    estimatedValue: 28000,
    proposedValue: 28000,
    probability: 10,
    weightedRevenue: 2800,
    estimatedCommission: 2800,
    estimatedCloseDate: '2026-10-15',
    score: 45,
    nextActionDescription: 'Retornar ligação para Secretária Executiva para confirmar agenda do Dr. Renato',
    nextActionDate: '2026-08-14T17:00:00Z',
    contacts: [
      {
        id: 'cnt_4',
        companyId: 'opp_3',
        name: 'Dr. Renato Alencar',
        jobTitle: 'Sócio Fundador & Médico Chefe',
        area: 'diretoria_clevel',
        phone: '(21) 97654-3210',
        email: 'renato@clinsaude.med.br',
        isDecisionMaker: true,
        decisionInfluence: 'alta',
      },
    ],
    qualification: {
      mainProblem: 'Taxa de no-show em consultas e exames de 28%.',
      impactedArea: 'Recepção e Call Center',
      currentWorkflow: 'Confirmação manual por WhatsApp número a número.',
      currentSystems: 'Software médico legado + WhatsApp Web',
      usesSpreadsheetsManual: true,
      hasUnintegratedSystems: true,
      mainBottleneck: 'Falta de automação nas mensagens de lembrete.',
      hasBudget: 'verba_em_definicao',
      urgencyLevel: 'media',
      opportunityPotential: 'medio',
    },
    activities: [
      {
        id: 'act_4',
        opportunityId: 'opp_3',
        consultantId: 'usr_tiago',
        activityType: 'ligacao',
        summary: 'Tentativa de contato telefônico',
        resultDetails: 'Secretária informou que o Dr. Renato estava em procedimento cirúrgico.',
        performedAt: '2026-08-14T11:30:00Z',
        nextAction: 'Retornar ligação para Secretária Executiva',
        nextActionDate: '2026-08-14T17:00:00Z',
      },
    ],
    createdAt: '2026-08-13T10:00:00Z',
    updatedAt: '2026-08-14T11:30:00Z',
  },
  {
    id: 'opp_4',
    companyName: 'SolarTech Energia Renovável',
    tradeName: 'SolarTech Brasil',
    segment: 'servicos',
    state: 'PR',
    city: 'Curitiba',
    companySize: 'media_50_199',
    employeeCount: 85,
    estimatedRevenueTier: '15m_a_50m',
    leadSource: 'site',
    consultantId: 'usr_ana',
    consultantName: 'Ana Ribeiro',
    title: 'Implementação de Pipeline de Vendas & Esteira de Engenharia',
    stage: 'negociacao',
    solutionService: 'Projeto Nexus Turnkey de Estruturação Comercial & PMO',
    estimatedValue: 95000,
    proposedValue: 88000,
    probability: 95,
    weightedRevenue: 83600,
    estimatedCommission: 8800,
    estimatedCloseDate: '2026-08-25',
    score: 96,
    nextActionDescription: 'Revisão final de cláusula de SLA no contrato jurídico com o CFO',
    nextActionDate: '2026-08-15T15:00:00Z',
    contacts: [
      {
        id: 'cnt_5',
        companyId: 'opp_4',
        name: 'Guilherme Castro',
        jobTitle: 'CFO / Diretor Financeiro',
        area: 'financeiro',
        phone: '(41) 98456-7890',
        email: 'guilherme@solartech.com.br',
        isDecisionMaker: true,
        decisionInfluence: 'alta',
      },
    ],
    qualification: {
      mainProblem: 'Gargalo na passagem de bastão entre time de vendas e engenharia de projetos fotovoltaicos.',
      impactedArea: 'Engenharia, Vendas e Financeiro',
      currentWorkflow: 'Propostas aprovadas ficam paradas 20 dias em fila de validação técnica.',
      currentSystems: 'HubSpot, Monday.com, ERP Omie',
      usesSpreadsheetsManual: true,
      hasUnintegratedSystems: true,
      mainBottleneck: 'Demora para compra de inversores e placas causa cancelamento de contratos.',
      hasBudget: 'sim_confirmado',
      urgencyLevel: 'critica_imediata',
      opportunityPotential: 'alto',
    },
    activities: [
      {
        id: 'act_5',
        opportunityId: 'opp_4',
        consultantId: 'usr_ana',
        activityType: 'reuniao',
        summary: 'Reunião de Alinhamento Comercial e Negociação de Escopo',
        resultDetails: 'Fechamos valor em R$ 88.000 em 3 parcelas. Minuta contratual enviada ao jurídico.',
        performedAt: '2026-08-13T14:00:00Z',
        nextAction: 'Revisão final de cláusula de SLA no contrato jurídico',
        nextActionDate: '2026-08-15T15:00:00Z',
      },
    ],
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-08-13T15:00:00Z',
  }
];
