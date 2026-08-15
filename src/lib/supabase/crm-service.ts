import { supabase } from './client';
import { Opportunity, PipelineStage, Activity, Contact, Qualification, Segment, RevenueTier } from '@/types/crm';
import { INITIAL_OPPORTUNITIES, STAGES } from '@/lib/mock-data';

// Helper para checar se uma string é UUID válido
function isUUID(str?: string): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper para converter registro do Supabase para formato Opportunity do frontend
type SupabaseRow = Record<string, unknown>;

const getString = (obj: SupabaseRow, key: string, fallback = ''): string =>
  (obj[key] as string) || fallback;

const getNumber = (obj: SupabaseRow, key: string, fallback = 0): number =>
  Number(obj[key]) || fallback;

const getBool = (obj: SupabaseRow, key: string, fallback = false): boolean =>
  obj[key] === undefined ? fallback : Boolean(obj[key]);

const toContactArea = (val: string): Contact['area'] => {
  const validAreas = ['diretoria_clevel', 'comercial', 'operacoes', 'ti_sistemas', 'financeiro', 'rh', 'outro'];
  return validAreas.includes(val) ? val as Contact['area'] : 'diretoria_clevel';
};

const toBudgetStatus = (val: string): Qualification['hasBudget'] => {
  const valid = ['sim_confirmado', 'verba_em_definicao', 'sem_orcamento', 'desconhecido'];
  return valid.includes(val) ? val as Qualification['hasBudget'] : 'verba_em_definicao';
};

const toActivityType = (val: string): Activity['activityType'] => {
  const valid = ['linkedin', 'email', 'reuniao', 'ligacao', 'whatsapp', 'visita_presencial'];
  return valid.includes(val) ? val as Activity['activityType'] : 'reuniao';
};

const toSegment = (val: string): Segment => {
  const valid = ['industria', 'varejo_ecom', 'servicos', 'tecnologia', 'saude', 'logistica', 'construcao', 'outro'];
  return valid.includes(val) ? val as Segment : 'servicos';
};

const toCompanySize = (val: string): Opportunity['companySize'] => {
  const valid = ['micro_1_9', 'pequena_10_49', 'media_50_199', 'grande_200_mais'];
  return valid.includes(val) ? val as Opportunity['companySize'] : 'media_50_199';
};

const toRevenueTier = (val: string): RevenueTier => {
  const valid = ['ate_360k', '360k_a_4_8m', '4_8m_a_15m', '15m_a_50m', 'acima_50m'];
  return valid.includes(val) ? val as RevenueTier : '15m_a_50m';
};

const toLeadSource = (val: string): Opportunity['leadSource'] => {
  const valid = ['linkedin', 'instagram', 'indicacao', 'evento', 'outbound', 'parceiro', 'site', 'pre_diagnostico', 'outro'];
  return valid.includes(val) ? val as Opportunity['leadSource'] : 'outbound';
};

const toPipelineStage = (val: string): PipelineStage => {
  const valid = [
    'lead_identificado', 'primeiro_contato', 'contato_realizado', 'pre_diag_agendado',
    'pre_diag_realizado', 'qualificado', 'diag_proposto', 'diag_contratado', 'diag_realizado',
    'solucao_identificada', 'proposta_enviada', 'negociacao', 'fechado_ganho', 'fechado_perdido'
  ];
  return valid.includes(val) ? val as PipelineStage : 'lead_identificado';
};

export function mapSupabaseToOpportunity(row: SupabaseRow): Opportunity {
  const company = (row.company as SupabaseRow) || {};
  const contacts: Contact[] = ((row.contacts as SupabaseRow[]) || []).map((c: SupabaseRow) => ({
    id: getString(c, 'id'),
    companyId: getString(row, 'company_id', 'comp_1'),
    name: getString(c, 'name', 'Contato'),
    jobTitle: getString(c, 'job_title') || getString(c, 'role', 'Executivo'),
    area: toContactArea(getString(c, 'area') || getString(c, 'department', 'diretoria_clevel')),
    phone: getString(c, 'phone'),
    email: getString(c, 'email'),
    isDecisionMaker: getBool(c, 'is_decision_maker', true),
    decisionInfluence: (() => {
        const inf = getString(c, 'decision_influence') || getString(c, 'influence_level');
        const validInfluence = ['baixa', 'media', 'alta'];
        return validInfluence.includes(inf) ? inf as DecisionInfluence : 'media';
      })(),
  }));

  const qual = (row.qualification as SupabaseRow) || {};
  const qualification: Qualification = row.qualification
    ? {
        mainProblem: getString(qual, 'main_problem') || getString(qual, 'bottleneck_details', 'Gargalos operacionais'),
        impactedArea: getString(qual, 'impacted_area', 'Operações e Comercial'),
        currentWorkflow: getString(qual, 'current_workflow', 'Processos manuais'),
        currentSystems: getString(qual, 'current_systems') || (getBool(qual, 'has_unintegrated_systems') ? 'Sistemas legados' : 'Nenhum'),
        usesSpreadsheetsManual: getBool(qual, 'uses_spreadsheets_manual', getBool(qual, 'manual_spreadsheets', true)),
        hasUnintegratedSystems: getBool(qual, 'has_unintegrated_systems', getBool(qual, 'unintegrated_systems', true)),
        mainBottleneck: getString(qual, 'main_bottleneck') || getString(qual, 'bottleneck_details', 'Falta de integração'),
        estimatedImpactCost: getString(qual, 'estimated_impact_cost') || (getString(qual, 'estimated_monthly_loss') ? `R$ ${getString(qual, 'estimated_monthly_loss')}/mês` : undefined),
        hasBudget: toBudgetStatus(getString(qual, 'has_budget') || (getBool(qual, 'has_budget_confirmed') ? 'sim_confirmado' : 'verba_em_definicao')),
        urgencyLevel: (() => {
        const urg = getString(qual, 'urgency_level');
        const validUrgency = ['baixa', 'media', 'alta', 'critica_imediata'];
        if (validUrgency.includes(urg)) return urg as Qualification['urgencyLevel'];
        return getNumber(qual, 'urgency_score') >= 4 ? 'alta' : 'media';
      })(),
        opportunityPotential: getString(qual, 'opportunity_potential', 'alto'),
        consultantNotes: getString(qual, 'consultant_notes') || getString(qual, 'notes'),
      }
    : {
        mainProblem: 'Gargalos de processos e dados dispersos',
        impactedArea: 'Operações e Comercial',
        currentWorkflow: 'Planilhas manuais',
        currentSystems: 'Sistemas legados não integrados',
        usesSpreadsheetsManual: true,
        hasUnintegratedSystems: true,
        mainBottleneck: 'Falta de visibilidade executiva',
        hasBudget: 'verba_em_definicao',
        urgencyLevel: 'alta',
        opportunityPotential: 'alto',
      };

  const activities: Activity[] = ((row.activities as SupabaseRow[]) || []).map((a: SupabaseRow) => ({
    id: getString(a, 'id'),
    opportunityId: getString(row, 'id'),
    consultantId: getString(row, 'consultant_id', 'usr_tiago'),
    activityType: toActivityType(getString(a, 'activity_type') || getString(a, 'type', 'reuniao')),
    summary: getString(a, 'summary') || getString(a, 'title', 'Reunião Realizada'),
    resultDetails: getString(a, 'result_details') || getString(a, 'description'),
    performedAt: getString(a, 'performed_at') || getString(a, 'scheduled_at') || getString(a, 'created_at', new Date().toISOString()),
    nextAction: getString(a, 'next_action') || getString(row, 'next_action_description', 'Follow-up'),
    nextActionDate: getString(a, 'next_action_date') || getString(row, 'next_action_date', new Date().toISOString()),
  }));

  return {
    id: getString(row, 'id'),
    companyName: getString(company, 'corporate_name') || getString(company, 'trade_name') || getString(company, 'legal_name', 'Empresa'),
    tradeName: getString(company, 'trade_name') || getString(company, 'corporate_name') || getString(company, 'legal_name', 'Empresa'),
    cnpj: getString(company, 'cnpj'),
    website: getString(company, 'website'),
    segment: toSegment(getString(company, 'segment', 'servicos')),
    state: getString(company, 'state', 'SP'),
    city: getString(company, 'city', 'São Paulo'),
    companySize: toCompanySize(getString(company, 'company_size', 'media_50_199')),
    employeeCount: getNumber(company, 'employee_count'),
    estimatedRevenueTier: toRevenueTier(getString(company, 'estimated_revenue_tier') || getString(company, 'revenue_tier', '15m_a_50m')),
    leadSource: toLeadSource(getString(company, 'lead_source', 'outbound')),
    consultantId: getString(row, 'consultant_id'),
    consultantName: getString((row.consultant as SupabaseRow) || {}, 'name', 'Consultor Nexus'),
    title: getString(row, 'title') || `Consultoria Estratégica - ${getString(company, 'trade_name', 'Empresa')}`,
    stage: toPipelineStage(getString(row, 'stage', 'lead_identificado')),
    lostReason: getString(row, 'lost_reason'),
    solutionService: getString(row, 'solution_service', 'Diagnóstico & Estruturação Comercial'),
    probability: getNumber(row, 'probability', 10),
    estimatedValue: getNumber(row, 'estimated_value', 30000),
    proposedValue: getNumber(row, 'proposed_value', getNumber(row, 'estimated_value', 30000)),
    weightedRevenue: getNumber(row, 'weighted_revenue', 3000),
    estimatedCommission: getNumber(row, 'estimated_commission', getNumber(row, 'weighted_revenue', 3000) * 0.1),
    estimatedCloseDate: getString(row, 'estimated_close_date', new Date().toISOString().split('T')[0]),
    score: getNumber(row, 'score', 60),
    nextActionDescription: getString(row, 'next_action_description', 'Agendar alinhamento'),
    nextActionDate: getString(row, 'next_action_date', new Date().toISOString()),
    createdAt: getString(row, 'created_at', new Date().toISOString()),
    updatedAt: getString(row, 'updated_at', new Date().toISOString()),
    contacts: contacts.length > 0 ? contacts : [
      {
        id: 'c1',
        companyId: getString(row, 'company_id', 'comp_1'),
        name: 'Contato Principal',
        jobTitle: 'Diretor Geral',
        area: 'diretoria_clevel',
        phone: '',
        email: '',
        isDecisionMaker: true,
        decisionInfluence: 'alta',
      }
    ],
    qualification,
    activities,
  };
}

export const crmService = {
  // 1. Listar oportunidades
  async getOpportunities(): Promise<Opportunity[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')) {
      return INITIAL_OPPORTUNITIES;
    }

    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          company:companies(*),
          consultant:profiles(*),
          contacts(*),
          qualification:qualifications(*),
          activities(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query error (usando mock data inicial):', error.message || error);
        return INITIAL_OPPORTUNITIES;
      }

      if (!data || data.length === 0) {
        return INITIAL_OPPORTUNITIES;
      }

      return data.map(mapSupabaseToOpportunity);
    } catch (err) {
      console.warn('Conexão Supabase indisponível, operando com dados locais:', err);
      return INITIAL_OPPORTUNITIES;
    }
  },

  // 2. Atualizar estágio e probabilidade (Kanban Drag & Drop)
  async updateStage(oppId: string, newStage: PipelineStage, probability: number, weightedRevenue: number) {
    // Se for lead mock (ex: 'opp_1', 'opp_2') ou Supabase não configurado, atualização é apenas local
    if (!isUUID(oppId) || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')) {
      return { success: true };
    }

    try {
      // Nota: weighted_revenue é coluna calculada (GENERATED ALWAYS) no Postgres, não enviamos diretamente
      const { error } = await supabase
        .from('opportunities')
        .update({
          stage: newStage,
          probability: probability,
          updated_at: new Date().toISOString(),
        })
        .eq('id', oppId);

      if (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn('Aviso ao sincronizar estágio no Supabase:', msg);
        return { success: false, error: msg };
      }
      return { success: true };
    } catch (err) {
      console.warn('Erro ao atualizar etapa no Supabase:', err?.message || err);
      return { success: false, error: err?.message };
    }
  },

  // 3. Criar nova Oportunidade completa (Quick Capture)
  async createOpportunity(opp: Partial<Opportunity>, userId?: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')) {
      return { success: true, data: opp };
    }

    try {
      // 1. Obter usuário atual autenticado ou perfil
      const { data: authUser } = await supabase.auth.getUser();
      const validUserId = authUser?.user?.id || (isUUID(userId) ? userId : null);

      if (!validUserId) {
        console.warn('Nenhum usuário autenticado com UUID do Supabase. O lead foi salvo localmente.');
        return { success: true, data: opp };
      }

      // 2. Inserir Empresa
      const { data: compData, error: compErr } = await supabase
        .from('companies')
        .insert({
          corporate_name: opp.companyName || 'Empresa',
          trade_name: opp.tradeName || opp.companyName || 'Empresa',
          segment: opp.segment || 'servicos',
          company_size: opp.companySize || 'media_50_199',
          estimated_revenue_tier: opp.estimatedRevenueTier || '15m_a_50m',
          lead_source: opp.leadSource || 'outbound',
          assigned_consultant_id: validUserId,
        })
        .select()
        .single();

      if (compErr) {
        console.warn('Aviso ao criar empresa no Supabase:', compErr.message);
        return { success: true, data: opp };
      }

      const companyId = compData.id;

      // 3. Inserir Oportunidade
      const { data: oppData, error: oppErr } = await supabase
        .from('opportunities')
        .insert({
          company_id: companyId,
          consultant_id: validUserId,
          title: opp.title || `Consultoria Estratégica - ${opp.tradeName || opp.companyName}`,
          stage: opp.stage || 'lead_identificado',
          solution_service: opp.solutionService || 'Diagnóstico & Estruturação Comercial',
          probability: opp.probability || 10,
          estimated_value: opp.estimatedValue || 30000,
          proposed_value: opp.proposedValue || opp.estimatedValue || 30000,
          score: opp.score || 50,
          next_action_description: opp.nextActionDescription || 'Agendar contato',
          next_action_date: opp.nextActionDate || new Date().toISOString(),
        })
        .select()
        .single();

      if (oppErr) {
        console.warn('Aviso ao criar oportunidade no Supabase:', oppErr.message);
        return { success: true, data: opp };
      }

      // 4. Inserir Contato Principal
      if (opp.contacts && opp.contacts.length > 0) {
        const c = opp.contacts[0];
        await supabase.from('contacts').insert({
          company_id: companyId,
          name: c.name || 'Contato Principal',
          job_title: c.jobTitle || 'Diretor',
          area: c.area || 'diretoria_clevel',
          phone: c.phone || '',
          email: c.email || '',
          is_decision_maker: c.isDecisionMaker ?? true,
          decision_influence: c.decisionInfluence || 'alta',
        });
      }

      // 5. Inserir Qualificação
      if (opp.qualification) {
        const q = opp.qualification;
        await supabase.from('qualifications').insert({
          opportunity_id: oppData.id,
          main_problem: q.mainProblem,
          impacted_area: q.impactedArea,
          current_workflow: q.currentWorkflow,
          current_systems: q.currentSystems,
          has_unintegrated_systems: q.hasUnintegratedSystems,
          uses_spreadsheets_manual: q.usesSpreadsheetsManual,
          main_bottleneck: q.mainBottleneck,
          has_budget: q.hasBudget,
          urgency_level: q.urgencyLevel,
          consultant_notes: q.consultantNotes,
        });
      }

      // 6. Inserir Primeira Atividade se houver
      if (opp.activities && opp.activities.length > 0) {
        const a = opp.activities[0];
        await supabase.from('activities').insert({
          opportunity_id: oppData.id,
          company_id: companyId,
          activity_type: a.activityType || 'reuniao',
          summary: a.summary || 'Primeiro Contato',
          result_details: a.resultDetails || '',
          next_action: a.nextAction,
          next_action_date: a.nextActionDate,
        });
      }

      return { success: true, id: oppData.id };
    } catch (err) {
      console.warn('Erro ao persistir novo lead no Supabase:', err?.message || err);
      return { success: true, data: opp };
    }
  },

  // 4. Inserir Atividade na timeline
  async addActivity(oppId: string, act: Activity) {
    if (!isUUID(oppId) || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')) {
      return { success: true };
    }

    try {
      await supabase.from('activities').insert({
        opportunity_id: oppId,
        activity_type: act.activityType,
        summary: act.summary,
        result_details: act.resultDetails,
        next_action: act.nextAction,
        next_action_date: act.nextActionDate,
      });

      if (act.nextAction && act.nextActionDate) {
        await supabase
          .from('opportunities')
          .update({
            next_action_description: act.nextAction,
            next_action_date: act.nextActionDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', oppId);
      }

      return { success: true };
    } catch (err) {
      console.warn('Aviso ao salvar atividade no Supabase:', err?.message || err);
      return { success: true };
    }
  },

  // 5. Configurar Realtime Sync
  subscribeToChanges(callback: () => void) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel('crm-realtime-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'opportunities' },
          () => {
            callback();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'activities' },
          () => {
            callback();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      return () => {};
    }
  },
};
