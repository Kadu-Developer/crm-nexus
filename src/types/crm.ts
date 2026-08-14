export type Segment = 
  | 'industria'
  | 'varejo_ecom'
  | 'servicos'
  | 'tecnologia'
  | 'saude'
  | 'logistica'
  | 'construcao'
  | 'outro';

export type CompanySize = 
  | 'micro_1_9'
  | 'pequena_10_49'
  | 'media_50_199'
  | 'grande_200_mais';

export type RevenueTier = 
  | 'ate_360k'
  | '360k_a_4_8m'
  | '4_8m_a_15m'
  | '15m_a_50m'
  | 'acima_50m';

export type LeadSource = 
  | 'linkedin'
  | 'instagram'
  | 'indicacao'
  | 'evento'
  | 'outbound'
  | 'parceiro'
  | 'site'
  | 'pre_diagnostico'
  | 'outro';

export type ContactArea = 
  | 'diretoria_clevel'
  | 'comercial'
  | 'operacoes'
  | 'ti_sistemas'
  | 'financeiro'
  | 'rh'
  | 'outro';

export type DecisionInfluence = 'baixa' | 'media' | 'alta';

export type PipelineStage = 
  | 'lead_identificado'
  | 'primeiro_contato'
  | 'contato_realizado'
  | 'pre_diag_agendado'
  | 'pre_diag_realizado'
  | 'qualificado'
  | 'diag_proposto'
  | 'diag_contratado'
  | 'diag_realizado'
  | 'solucao_identificada'
  | 'proposta_enviada'
  | 'negociacao'
  | 'fechado_ganho'
  | 'fechado_perdido';

export type StageMacroPhase = 'prospeccao' | 'diagnostico' | 'solucao' | 'conclusao';

export interface StageDefinition {
  id: PipelineStage;
  title: string;
  shortTitle: string;
  phase: StageMacroPhase;
  defaultProbability: number;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin_ceo' | 'consultant' | 'viewer';
  avatar: string;
  commissionRate: number; // e.g. 10%
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  jobTitle: string;
  area: ContactArea;
  phone: string;
  email: string;
  linkedinUrl?: string;
  isDecisionMaker: boolean;
  decisionInfluence: DecisionInfluence;
}

export interface Qualification {
  mainProblem: string;
  impactedArea: string;
  currentWorkflow: string;
  currentSystems: string;
  usesSpreadsheetsManual: boolean;
  hasUnintegratedSystems: boolean;
  mainBottleneck: string;
  estimatedImpactCost?: string;
  hasBudget: 'sim_confirmado' | 'verba_em_definicao' | 'sem_orcamento' | 'desconhecido';
  urgencyLevel: 'baixa' | 'media' | 'alta' | 'critica_imediata';
  desiredTimeline?: string;
  competitorSupplier?: string;
  opportunityPotential: 'baixo' | 'medio' | 'alto';
  consultantNotes?: string;
}

export interface Activity {
  id: string;
  opportunityId: string;
  consultantId: string;
  activityType: 'ligacao' | 'whatsapp' | 'email' | 'reuniao' | 'linkedin' | 'visita_presencial';
  summary: string;
  resultDetails: string;
  performedAt: string;
  nextAction: string;
  nextActionDate: string;
}

export interface Opportunity {
  id: string;
  companyName: string;
  tradeName: string;
  cnpj?: string;
  website?: string;
  segment: Segment;
  state: string;
  city: string;
  companySize: CompanySize;
  employeeCount?: number;
  estimatedRevenueTier?: RevenueTier;
  leadSource: LeadSource;
  
  consultantId: string;
  consultantName: string;
  
  title: string;
  stage: PipelineStage;
  lostReason?: string;
  solutionService: string;
  estimatedValue: number;
  proposedValue: number;
  probability: number;
  weightedRevenue: number;
  estimatedCommission: number;
  estimatedCloseDate: string;
  
  score: number; // 0 - 100
  
  // Regra de Ouro: Próxima Ação
  nextActionDescription: string;
  nextActionDate: string;
  
  contacts: Contact[];
  qualification: Qualification;
  activities: Activity[];
  
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}
