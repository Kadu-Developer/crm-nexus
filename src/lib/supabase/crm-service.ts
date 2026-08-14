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
export function mapSupabaseToOpportunity(row: any): Opportunity {
  const company = row.company || {};
  const contacts: Contact[] = (row.contacts || []).map((c: any) => ({
    id: c.id,
    companyId: row.company_id || 'comp_1',
    name: c.name || 'Contato',
    jobTitle: c.job_title || c.role || 'Executivo',
    area: c.area || c.department || 'diretoria_clevel',
    phone: c.phone || '',
    email: c.email || '',
    isDecisionMaker: c.is_decision_maker ?? true,
    decisionInfluence: c.decision_influence || (c.influence_level === 'alta' ? 'alta' : 'media'),
  }));

  const qualification: Qualification = row.qualification
    ? {
        mainProblem: row.qualification.main_problem || row.qualification.bottleneck_details || 'Gargalos operacionais',
        impactedArea: row.qualification.impacted_area || 'Operações e Comercial',
        currentWorkflow: row.qualification.current_workflow || 'Processos manuais',
        currentSystems: row.qualification.current_systems || (row.qualification.has_unintegrated_systems ? 'Sistemas legados' : 'Nenhum'),
        usesSpreadsheetsManual: row.qualification.uses_spreadsheets_manual ?? row.qualification.manual_spreadsheets ?? true,
        hasUnintegratedSystems: row.qualification.has_unintegrated_systems ?? row.qualification.unintegrated_systems ?? true,
        mainBottleneck: row.qualification.main_bottleneck || row.qualification.bottleneck_details || 'Falta de integração',
        estimatedImpactCost: row.qualification.estimated_impact_cost || (row.qualification.estimated_monthly_loss ? `R$ ${row.qualification.estimated_monthly_loss}/mês` : undefined),
        hasBudget: row.qualification.has_budget || (row.qualification.has_budget_confirmed ? 'sim_confirmado' : 'verba_em_definicao'),
        urgencyLevel: row.qualification.urgency_level || (row.qualification.urgency_score >= 4 ? 'alta' : 'media'),
        opportunityPotential: row.qualification.opportunity_potential || 'alto',
        consultantNotes: row.qualification.consultant_notes || row.qualification.notes || '',
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

  const activities: Activity[] = (row.activities || []).map((a: any) => ({
    id: a.id,
    opportunityId: row.id,
    consultantId: row.consultant_id || 'usr_tiago',
    activityType: a.activity_type || a.type || 'reuniao',
    summary: a.summary || a.title || 'Reunião Realizada',
    resultDetails: a.result_details || a.description || '',
    performedAt: a.performed_at || a.scheduled_at || a.created_at || new Date().toISOString(),
    nextAction: a.next_action || row.next_action_description || 'Follow-up',
    nextActionDate: a.next_action_date || row.next_action_date || new Date().toISOString(),
  }));

  return {
    id: row.id,
    companyName: company.corporate_name || company.trade_name || company.legal_name || 'Empresa',
    tradeName: company.trade_name || company.corporate_name || company.legal_name || 'Empresa',
    cnpj: company.cnpj || '',
    website: company.website || '',
    segment: (company.segment as Segment) || 'servicos',
    state: company.state || 'SP',
    city: company.city || 'São Paulo',
    companySize: company.company_size || 'media_50_199',
    employeeCount: company.employee_count,
    estimatedRevenueTier: (company.estimated_revenue_tier as RevenueTier) || (company.revenue_tier as RevenueTier) || '15m_a_50m',
    leadSource: company.lead_source || 'outbound',
    consultantId: row.consultant_id,
    consultantName: row.consultant?.name || 'Consultor Nexus',
    title: row.title || `Consultoria Estratégica - ${company.trade_name || 'Empresa'}`,
    stage: row.stage as PipelineStage,
    lostReason: row.lost_reason,
    solutionService: row.solution_service || 'Diagnóstico & Estruturação Comercial',
    probability: Number(row.probability || 10),
    estimatedValue: Number(row.estimated_value || 30000),
    proposedValue: Number(row.proposed_value || row.estimated_value || 30000),
    weightedRevenue: Number(row.weighted_revenue || 3000),
    estimatedCommission: Number(row.estimated_commission || (row.weighted_revenue ? row.weighted_revenue * 0.1 : 300)),
    estimatedCloseDate: row.estimated_close_date || new Date().toISOString().split('T')[0],
    score: Number(row.score || 60),
    nextActionDescription: row.next_action_description || 'Agendar alinhamento',
    nextActionDate: row.next_action_date || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    contacts: contacts.length > 0 ? contacts : [
      {
        id: 'c1',
        companyId: row.company_id || 'comp_1',
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
        console.warn('Aviso ao sincronizar estágio no Supabase:', error.message || error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
