import { PipelineStage, StageDefinition, StageMacroPhase, Opportunity, User } from '@/types/crm';

export const USERS: User[] = [
  {
    id: 'usr_carlos',
    name: 'Carlos Eduardo',
    email: 'carlos@nexusflowtech.com.br',
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

export const INITIAL_OPPORTUNITIES: Opportunity[] = [];
