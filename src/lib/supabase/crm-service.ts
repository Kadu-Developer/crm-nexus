import { supabase } from './client';
import { Opportunity, PipelineStage, Activity, Contact, Qualification, Segment, RevenueTier, DecisionInfluence } from '@/types/crm';
import { INITIAL_OPPORTUNITIES } from '@/lib/mock-data';

const DEMO_OPPORTUNITIES_KEY = 'nexus_demo_opportunities';

async function getDemoOpportunities(): Promise<Opportunity[]> {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(DEMO_OPPORTUNITIES_KEY);
    let storedOpportunities = stored ? JSON.parse(stored) as Opportunity[] : [];
    
    // Remove quaisquer leads mock legados (ex: opp_1, opp_2)
    storedOpportunities = storedOpportunities.filter((o) => !o.id.startsWith('opp_'));
    saveDemoOpportunities(storedOpportunities);

    const sheetOpportunities = await getGoogleSheetOpportunities();
    if (sheetOpportunities.length > 0) {
      const existingKeys = new Set(storedOpportunities.map((opportunity) => opportunity.cnpj || opportunity.companyName.toLowerCase()));
      const newSheetOpportunities = sheetOpportunities.filter((opportunity) => {
        const key = opportunity.cnpj || opportunity.companyName.toLowerCase();
        return !existingKeys.has(key);
      });
      const mergedOpportunities = [...storedOpportunities, ...newSheetOpportunities];
      saveDemoOpportunities(mergedOpportunities);
      return mergedOpportunities;
    }
    return storedOpportunities;
  } catch {
    return [];
  }
}

function saveDemoOpportunities(opportunities: Opportunity[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_OPPORTUNITIES_KEY, JSON.stringify(opportunities));
  }
}

function parseCsvRow(row: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"' && row[index + 1] === '"' && quoted) {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

function normalizeSheetValue(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function parseSheetDate(value: string): string {
  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4}).*?(\d{2}):(\d{2})/);
  if (!match) return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return new Date(`${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:00`).toISOString();
}

function mapSheetRow(headers: string[], values: string[], index: number): Opportunity | null {
  const row = Object.fromEntries(headers.map((header, headerIndex) => [normalizeSheetValue(header), values[headerIndex] || '']));
  const companyName = row['razao social'];
  const contactName = row['nome do contato'];
  if (!companyName || !contactName) return null;

  const segmentMap: Record<string, Segment> = { tecnologia: 'tecnologia', varejo: 'varejo_ecom', servicos: 'servicos', industria: 'industria', saude: 'saude', educacao: 'outro', financeiro: 'servicos' };
  const sizeMap: Record<string, Opportunity['companySize']> = { mei: 'micro_1_9', microempresa: 'micro_1_9', pequena: 'pequena_10_49', media: 'media_50_199', grande: 'grande_200_mais' };
  const sourceMap: Record<string, Opportunity['leadSource']> = { indicacao: 'indicacao', 'redes sociais': 'instagram', 'busca google': 'site', evento: 'evento', outros: 'outro' };
  const stageMap: Record<string, PipelineStage> = { prospeccao: 'lead_identificado', 'reuniao agendada': 'pre_diag_agendado', 'proposta enviada': 'proposta_enviada', negociacao: 'negociacao', 'fechado ganho': 'fechado_ganho', 'fechado perdido': 'fechado_perdido' };

  return {
    id: `sheet_lead_${index + 1}`,
    companyName,
    tradeName: row['nome fantasia'] || companyName,
    cnpj: row['cnpj'] || undefined,
    website: row['site'] || undefined,
    segment: segmentMap[normalizeSheetValue(row['segmento'])] || 'servicos',
    state: row['estado'] || 'SP',
    city: row['cidade'] || 'São Paulo',
    companySize: sizeMap[normalizeSheetValue(row['porte'])] || 'media_50_199',
    employeeCount: Number(row['numero de funcionarios']) || undefined,
    estimatedRevenueTier: '15m_a_50m',
    leadSource: sourceMap[normalizeSheetValue(row['origem'])] || 'outbound',
    consultantId: 'usr_carlos',
    consultantName: 'Carlos Eduardo',
    title: `Diagnóstico de Processos - ${companyName}`,
    stage: stageMap[normalizeSheetValue(row['status do lead'])] || 'lead_identificado',
    solutionService: 'Diagnóstico & Estruturação Comercial',
    probability: 25,
    estimatedValue: Number(row['valor estimado']) || 35000,
    proposedValue: Number(row['valor estimado']) || 35000,
    weightedRevenue: (Number(row['valor estimado']) || 35000) * 0.25,
    estimatedCommission: ((Number(row['valor estimado']) || 35000) * 0.25) * 0.1,
    estimatedCloseDate: parseSheetDate(row['data e hora da reuniao'] || '').split('T')[0],
    score: 65,
    nextActionDescription: row['observacoes / dor principal'] || 'Realizar contato de qualificação',
    nextActionDate: parseSheetDate(row['data e hora da reuniao'] || ''),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contacts: [
      {
        id: `cnt_sheet_${index + 1}`,
        companyId: `sheet_lead_${index + 1}`,
        name: contactName,
        jobTitle: row['cargo do contato'] || 'Executivo',
        area: 'diretoria_clevel',
        phone: row['telefone / whatsapp'] || '',
        email: row['e-mail'] || '',
        isDecisionMaker: true,
        decisionInfluence: 'alta',
      },
    ],
    qualification: {
      mainProblem: row['observacoes / dor principal'] || 'Mapeamento inicial de processos e automação',
      impactedArea: 'Operações e Comercial',
      currentWorkflow: 'Processos manuais',
      currentSystems: 'Sistemas legados',
      usesSpreadsheetsManual: true,
      hasUnintegratedSystems: true,
      mainBottleneck: 'Falta de visibilidade e automação',
      hasBudget: 'verba_em_definicao',
      urgencyLevel: 'alta',
      opportunityPotential: 'alto',
      consultantNotes: row['observacoes / dor principal'] || '',
    },
    activities: [],
  };
}

async function getGoogleSheetOpportunities(): Promise<Opportunity[]> {
  if (typeof window === 'undefined') return [];
  const imported: Opportunity[] = [];
  try {
    const response = await fetch('/api/google-sheets');
    if (!response.ok) return imported;
    const { sheets } = await response.json() as { sheets: string[] };
    sheets.forEach((csv) => {
      const lines = csv.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;
      const headers = parseCsvRow(lines[0]);
      lines.slice(1).forEach((line, index) => {
        const opportunity = mapSheetRow(headers, parseCsvRow(line), imported.length + index);
        if (opportunity) imported.push(opportunity);
      });
    });
  } catch {
    // Silently fall back
  }
  return imported;
}

function isUUID(str?: string): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

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

const toOpportunityPotential = (val: string): Qualification['opportunityPotential'] => {
  const valid = ['baixo', 'medio', 'alto'];
  return valid.includes(val) ? val as Qualification['opportunityPotential'] : 'medio';
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
        hasBudget: toBudgetStatus(getString(qual, 'has_budget')),
        urgencyLevel: (() => {
          const u = getString(qual, 'urgency_level');
          const valid = ['baixa', 'media', 'alta', 'critica_imediata'];
          return valid.includes(u) ? u as Qualification['urgencyLevel'] : 'alta';
        })(),
        desiredTimeline: getString(qual, 'desired_timeline'),
        competitorSupplier: getString(qual, 'competitor_supplier'),
        opportunityPotential: toOpportunityPotential(getString(qual, 'opportunity_potential')),
        consultantNotes: getString(qual, 'consultant_notes'),
      }
    : {
        mainProblem: 'Qualificação pendente',
        impactedArea: 'A definir',
        currentWorkflow: 'Não informado',
        currentSystems: 'Não informado',
        usesSpreadsheetsManual: false,
        hasUnintegratedSystems: false,
        mainBottleneck: 'A definir',
        hasBudget: 'desconhecido',
        urgencyLevel: 'media',
        opportunityPotential: 'medio',
      };

  const activities: Activity[] = ((row.activities as SupabaseRow[]) || []).map((a: SupabaseRow) => ({
    id: getString(a, 'id'),
    opportunityId: getString(a, 'opportunity_id', getString(row, 'id')),
    consultantId: getString(a, 'consultant_id', getString(row, 'consultant_id')),
    activityType: toActivityType(getString(a, 'activity_type') || getString(a, 'type', 'reuniao')),
    summary: getString(a, 'summary') || getString(a, 'title', 'Atividade comercial'),
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
    consultantName: getString((row.consultant as SupabaseRow) || {}, 'name', 'Carlos Eduardo'),
    title: getString(row, 'title') || `Consultoria - ${getString(company, 'trade_name', 'Empresa')}`,
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
    contacts: contacts.length > 0 ? contacts : [],
    qualification,
    activities,
  };
}

export const crmService = {
  // 1. Listar oportunidades (Supabase ➔ Google Sheets / Local)
  async getOpportunities(): Promise<Opportunity[]> {
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

      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseToOpportunity);
      }
    } catch (err) {
      console.warn('Conexão Supabase query falhou:', err);
    }

    return getDemoOpportunities();
  },

  // 2. Atualizar estágio e probabilidade (Kanban Drag & Drop)
  async updateStage(oppId: string, newStage: PipelineStage, probability: number, weightedRevenue: number) {
    try {
      if (isUUID(oppId)) {
        const { error } = await supabase
          .from('opportunities')
          .update({
            stage: newStage,
            probability: probability,
            updated_at: new Date().toISOString(),
          })
          .eq('id', oppId);

        if (!error) return { success: true };
      }
    } catch (err) {
      console.warn('Erro ao atualizar etapa no Supabase:', err);
    }

    // Atualização local de fallback
    const current = await getDemoOpportunities();
    const updated = current.map((o) => (o.id === oppId ? { ...o, stage: newStage, probability, weightedRevenue, updatedAt: new Date().toISOString() } : o));
    saveDemoOpportunities(updated);
    return { success: true };
  },

  // 3. Criar nova Oportunidade completa (Quick Capture)
  async createOpportunity(opp: Partial<Opportunity>, userId?: string) {
    try {
      // 1. Obter usuário autenticado
      const { data: authUser } = await supabase.auth.getUser();
      const validUserId = authUser?.user?.id || (isUUID(userId) ? userId : null);

      if (validUserId) {
        // 2. Inserir Empresa
        const { data: compData, error: compErr } = await supabase
          .from('companies')
          .insert({
            corporate_name: opp.companyName || 'Empresa',
            trade_name: opp.tradeName || opp.companyName || 'Empresa',
            cnpj: opp.cnpj || null,
            website: opp.website || null,
            segment: opp.segment || 'servicos',
            company_size: opp.companySize || 'media_50_199',
            estimated_revenue_tier: opp.estimatedRevenueTier || '15m_a_50m',
            lead_source: opp.leadSource || 'outbound',
            assigned_consultant_id: validUserId,
          })
          .select()
          .single();

        if (!compErr && compData) {
          const companyId = compData.id;

          // 3. Inserir Oportunidade
          const { data: oppData, error: oppErr } = await supabase
            .from('opportunities')
            .insert({
              company_id: companyId,
              consultant_id: validUserId,
              title: opp.title || `Consultoria - ${opp.tradeName || opp.companyName}`,
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

          if (!oppErr && oppData) {
            // 4. Inserir Contato
            if (opp.contacts && opp.contacts.length > 0) {
              const c = opp.contacts[0];
              await supabase.from('contacts').insert({
                company_id: companyId,
                name: c.name || 'Contato Principal',
                job_title: c.jobTitle || 'Diretor',
                area: c.area || 'diretoria_clevel',
                phone: c.phone || '',
                email: c.email || '',
                linkedin_url: c.linkedinUrl || null,
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

            return { success: true, data: { ...opp, id: oppData.id } };
          }
        }
      }
    } catch (err) {
      console.warn('Erro ao inserir lead no Supabase:', err);
    }

    // Fallback local
    const currentOpportunities = await getDemoOpportunities();
    const newLocalOpp: Opportunity = {
      ...opp,
      id: `lead_${Date.now()}`,
      companyName: opp.companyName || 'Empresa',
      tradeName: opp.tradeName || opp.companyName || 'Empresa',
      segment: opp.segment || 'servicos',
      state: opp.state || 'SP',
      city: opp.city || 'São Paulo',
      companySize: opp.companySize || 'media_50_199',
      leadSource: opp.leadSource || 'outbound',
      consultantId: opp.consultantId || 'usr_carlos',
      consultantName: opp.consultantName || 'Carlos Eduardo',
      title: opp.title || `Consultoria - ${opp.tradeName || opp.companyName}`,
      stage: opp.stage || 'lead_identificado',
      solutionService: opp.solutionService || 'Diagnóstico & Estruturação Comercial',
      probability: opp.probability || 10,
      estimatedValue: opp.estimatedValue || 30000,
      proposedValue: opp.proposedValue || 30000,
      weightedRevenue: (opp.estimatedValue || 30000) * 0.1,
      estimatedCommission: (opp.estimatedValue || 30000) * 0.01,
      estimatedCloseDate: opp.estimatedCloseDate || new Date().toISOString().split('T')[0],
      score: opp.score || 50,
      nextActionDescription: opp.nextActionDescription || 'Agendar alinhamento',
      nextActionDate: opp.nextActionDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contacts: opp.contacts || [],
      qualification: opp.qualification || {
        mainProblem: 'Mapeamento pendente',
        impactedArea: 'A definir',
        currentWorkflow: 'Manual',
        currentSystems: 'Nenhum',
        usesSpreadsheetsManual: true,
        hasUnintegratedSystems: false,
        mainBottleneck: 'A definir',
        hasBudget: 'desconhecido',
        urgencyLevel: 'media',
        opportunityPotential: 'medio',
      },
      activities: [],
    };
    saveDemoOpportunities([...currentOpportunities, newLocalOpp]);
    return { success: true, data: newLocalOpp };
  },

  // 4. Adicionar Atividade
  async addActivity(oppId: string, activity: Omit<Activity, 'id' | 'performedAt'>, userId?: string) {
    try {
      if (isUUID(oppId)) {
        const { data: authUser } = await supabase.auth.getUser();
        const validUserId = authUser?.user?.id || (isUUID(userId) ? userId : null);

        if (validUserId) {
          await supabase.from('activities').insert({
            opportunity_id: oppId,
            consultant_id: validUserId,
            activity_type: activity.activityType,
            summary: activity.summary,
            result_details: activity.resultDetails,
            next_action: activity.nextAction,
            next_action_date: activity.nextActionDate,
          });

          if (activity.nextAction && activity.nextActionDate) {
            await supabase
              .from('opportunities')
              .update({
                next_action_description: activity.nextAction,
                next_action_date: activity.nextActionDate,
                updated_at: new Date().toISOString(),
              })
              .eq('id', oppId);
          }

          return { success: true };
        }
      }
    } catch (err) {
      console.warn('Erro ao adicionar atividade no Supabase:', err);
    }

    const currentOpportunities = await getDemoOpportunities();
    const newAct: Activity = {
      ...activity,
      id: `act_${Date.now()}`,
      opportunityId: oppId,
      performedAt: new Date().toISOString(),
    };
    const updatedOpportunities = currentOpportunities.map((opportunity) => {
      if (opportunity.id === oppId) {
        return {
          ...opportunity,
          activities: [newAct, ...opportunity.activities],
          nextActionDescription: activity.nextAction || opportunity.nextActionDescription,
          nextActionDate: activity.nextActionDate || opportunity.nextActionDate,
          updatedAt: new Date().toISOString(),
        };
      }
      return opportunity;
    });
    saveDemoOpportunities(updatedOpportunities);
    return { success: true };
  },

  // 5. Atualizar Qualificação
  async updateQualification(oppId: string, qual: Partial<Qualification>) {
    try {
      if (isUUID(oppId)) {
        await supabase
          .from('qualifications')
          .update({
            main_problem: qual.mainProblem,
            impacted_area: qual.impactedArea,
            current_workflow: qual.currentWorkflow,
            current_systems: qual.currentSystems,
            uses_spreadsheets_manual: qual.usesSpreadsheetsManual,
            has_unintegrated_systems: qual.hasUnintegratedSystems,
            main_bottleneck: qual.mainBottleneck,
            estimated_impact_cost: qual.estimatedImpactCost,
            has_budget: qual.hasBudget,
            urgency_level: qual.urgencyLevel,
            desired_timeline: qual.desiredTimeline,
            competitor_supplier: qual.competitorSupplier,
            opportunity_potential: qual.opportunityPotential,
            consultant_notes: qual.consultantNotes,
          })
          .eq('opportunity_id', oppId);

        return { success: true };
      }
    } catch (err) {
      console.warn('Erro ao atualizar qualificação no Supabase:', err);
    }

    const currentOpportunities = await getDemoOpportunities();
    const updatedOpportunities = currentOpportunities.map((opportunity) => {
      if (opportunity.id === oppId) {
        return {
          ...opportunity,
          qualification: { ...opportunity.qualification, ...qual },
          updatedAt: new Date().toISOString(),
        };
      }
      return opportunity;
    });
    saveDemoOpportunities(updatedOpportunities);
    return { success: true };
  },

  // 6. Subscrição em Tempo Real (Supabase Realtime Channels)
  subscribeToChanges(callback: () => void): () => void {
    const channel = supabase
      .channel('public:crm_realtime_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => {
        callback();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        callback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // 7. Excluir oportunidade (apenas para administradores)
  async deleteOpportunity(oppId: string): Promise<{ success: boolean }> {
    try {
      if (isUUID(oppId)) {
        const { error } = await supabase
          .from('opportunities')
          .delete()
          .eq('id', oppId);

        if (!error) return { success: true };
      }
    } catch (err) {
      console.warn('Erro ao excluir oportunidade no Supabase:', err);
    }

    // Fallback local
    const currentOpportunities = await getDemoOpportunities();
    const updatedOpportunities = currentOpportunities.filter((o) => o.id !== oppId);
    saveDemoOpportunities(updatedOpportunities);
    return { success: true };
  }
};
