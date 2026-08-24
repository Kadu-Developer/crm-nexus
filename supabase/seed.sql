-- ==============================================================================
-- NEXUS CRM - SEED DATA FOR DEVELOPMENT
-- ==============================================================================
-- Este arquivo popula o banco com dados de exemplo para desenvolvimento.
-- Execute após as migrations: `supabase db seed` ou via Dashboard > SQL Editor.
--
-- IMPORTANTE: A tabela profiles tem FK para auth.users.
-- Para popular profiles, os usuários devem existir em auth.users.
-- Opções:
--   A) Use o Supabase Dashboard > Authentication > Users > "Add user" para criar os 3 usuários primeiro
--   B) Use a CLI: `supabase db seed` (cria usuários via auth admin API)
--   C) Descomente o bloco abaixo para desabilitar FK temporariamente (apenas dev!)
-- ==============================================================================

-- OPÇÃO C: Desabilitar FK temporariamente (APENAS DESENVOLVIMENTO)
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 1. LIMPAR DADOS EXISTENTES (ordem respeita FKs)
TRUNCATE TABLE public.activities, public.qualifications, public.contacts, public.opportunities, public.companies, public.profiles RESTART IDENTITY CASCADE;

-- 2. PERFIS (profiles) - IDs fixos para referenciar nas demais tabelas
-- NOTA: Estes UUIDs devem corresponder a usuários existentes em auth.users
-- Se usar Opção C acima, pode inserir direto. Senão, crie os usuários no Auth primeiro.
INSERT INTO public.profiles (id, name, email, role, avatar_url, commission_rate, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tiago Santos', 'tiago@nexus.com.br', 'consultant', 'TS', 10.00, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Ana Ribeiro', 'ana@nexus.com.br', 'consultant', 'AR', 10.00, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Diretoria Executiva', 'diretoria@nexus.com.br', 'admin_ceo', 'CEO', 0.00, NOW(), NOW());

-- Reabilitar FK se desabilitou acima (Opção C)
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. EMPRESAS (companies)
INSERT INTO public.companies (id, corporate_name, trade_name, cnpj, website, segment, state, city, company_size, employee_count, estimated_revenue_tier, lead_source, assigned_consultant_id, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'LogiTrans Logística e Transportes S.A.', 'LogiTrans Brasil', '12.345.678/0001-90', 'https://logitrans.com.br', 'logistica', 'SP', 'Campinas', 'media_50_199', 140, '15m_a_50m', 'linkedin', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Metalúrgica InoxForge Ltda', 'InoxForge', '98.765.432/0001-11', NULL, 'industria', 'MG', 'Contagem', 'grande_200_mais', 320, 'acima_50m', 'indicacao', '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'ClinSaúde Diagnósticos Médicos', 'Rede ClinSaúde', '44.555.666/0001-22', NULL, 'saude', 'RJ', 'Rio de Janeiro', 'pequena_10_49', 45, '4_8m_a_15m', 'outbound', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'SolarTech Energia Renovável', 'SolarTech Brasil', NULL, NULL, 'servicos', 'PR', 'Curitiba', 'media_50_199', 85, '15m_a_50m', 'site', '22222222-2222-2222-2222-222222222222', NOW(), NOW());

-- 4. OPORTUNIDADES (opportunities)
INSERT INTO public.opportunities (id, company_id, consultant_id, title, stage, lost_reason, solution_service, estimated_value, proposed_value, probability, estimated_commission, estimated_close_date, score, next_action_description, next_action_date, created_at, updated_at, closed_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Diagnóstico Operacional & Integração WMS/ERP', 'pre_diag_realizado', NULL, 'Diagnóstico de Processos + Integração de Sistemas', 45000, 48000, 35, 4800, '2026-09-30', 85, 'Apresentar relatório executivo do Pré-Diagnóstico para o Diretor de Operações', '2026-08-16T14:30:00Z', NOW(), NOW(), NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', 'Diagnóstico Completo de Eficiência Fabril & PCP', 'diag_proposto', NULL, 'Diagnóstico Nexus Deep Dive PCP + OEE', 65000, 62000, 55, 6200, '2026-09-15', 92, 'Follow-up da proposta de diagnóstico com o Diretor Industrial (Sr. Carlos)', '2026-08-15T10:00:00Z', NOW(), NOW(), NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111', 'Otimização da Jornada de Agendamento & Atendimento', 'primeiro_contato', NULL, 'Diagnóstico Comercial e CRM de Atendimento', 28000, 28000, 10, 2800, '2026-10-15', 45, 'Retornar ligação para Secretária Executiva para confirmar agenda do Dr. Renato', '2026-08-14T17:00:00Z', NOW(), NOW(), NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '22222222-2222-2222-2222-222222222222', 'Implementação de Pipeline de Vendas & Esteira de Engenharia', 'negociacao', NULL, 'Projeto Nexus Turnkey de Estruturação Comercial & PMO', 95000, 88000, 95, 8800, '2026-08-25', 96, 'Revisão final de cláusula de SLA no contrato jurídico com o CFO', '2026-08-15T15:00:00Z', NOW(), NOW(), NULL);

-- 5. CONTATOS (contacts)
INSERT INTO public.contacts (id, company_id, name, job_title, area, phone, email, linkedin_url, is_decision_maker, decision_influence, created_at) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Roberto Viana', 'Diretor de Operações (COO)', 'operacoes', '(19) 98765-4321', 'roberto.viana@logitrans.com.br', 'https://linkedin.com/in/robertoviana', TRUE, 'alta', NOW()),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Mariana Duarte', 'Coordenadora de TI', 'ti_sistemas', '(19) 98123-9988', 'mariana.ti@logitrans.com.br', NULL, FALSE, 'media', NOW()),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Carlos Drummond', 'Diretor Industrial', 'diretoria_clevel', '(31) 99888-1122', 'carlos.drummond@inoxforge.com.br', NULL, TRUE, 'alta', NOW()),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Dr. Renato Alencar', 'Sócio Fundador & Médico Chefe', 'diretoria_clevel', '(21) 97654-3210', 'renato@clinsaude.med.br', NULL, TRUE, 'alta', NOW()),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Guilherme Castro', 'CFO / Diretor Financeiro', 'financeiro', '(41) 98456-7890', 'guilherme@solartech.com.br', NULL, TRUE, 'alta', NOW());

-- 6. QUALIFICAÇÕES (qualifications)
INSERT INTO public.qualifications (id, opportunity_id, main_problem, impacted_area, current_workflow, current_systems, uses_spreadsheets_manual, has_unintegrated_systems, main_bottleneck, estimated_impact_cost, has_budget, urgency_level, desired_timeline, competitor_supplier, opportunity_potential, consultant_notes, created_at) VALUES
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Falta de visibilidade do estoque em tempo real e retrabalho manual diário entre WMS e ERP Totvs.', 'Operações e Logística', 'Operadores exportam planilhas do WMS 3x ao dia e digitam manualmente no ERP. Alto índice de erros.', 'Totvs Protheus, WMS proprietário antigo, Excel', TRUE, TRUE, 'Fechamento de expedição demora 4 horas além do expediente normal.', 'R$ 35.000/mês em horas extras e perdas por divergência de carga.', 'sim_confirmado', 'alta', 'Q4 2026', 'Nenhum atualmente (tentaram consultoria interna sem sucesso)', 'alto', 'Cliente muito receptivo. O COO reconheceu que o gargalo está impedindo a expansão de novos centros de distribuição.', NOW()),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Paradas não planejadas de linha e falta de acurácia no apontamento de refugo.', 'Chão de fábrica e PCP', 'Apontamento em fichas de papel preenchidas pelos operadores ao final do turno.', 'SAP ECC, planilhas de controle de qualidade', TRUE, TRUE, 'Descobrem que o lote está defeituoso somente 2 dias após a fundição.', 'R$ 80.000/mês em refugo e retrabalho.', 'sim_confirmado', 'critica_imediata', 'Início imediato em Setembro', 'Concorrente local ofereceu escopo fraco.', 'alto', 'Diretoria já aprovou a contratação de consultoria externa. Concorrente local ofereceu escopo fraco.', NOW()),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'Taxa de no-show em consultas e exames de 28%.', 'Recepção e Call Center', 'Confirmação manual por WhatsApp número a número.', 'Software médico legado + WhatsApp Web', TRUE, TRUE, 'Falta de automação nas mensagens de lembrete.', NULL, 'verba_em_definicao', 'media', NULL, NULL, 'medio', NULL, NOW()),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd4', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'Gargalo na passagem de bastão entre time de vendas e engenharia de projetos fotovoltaicos.', 'Engenharia, Vendas e Financeiro', 'Propostas aprovadas ficam paradas 20 dias em fila de validação técnica.', 'HubSpot, Monday.com, ERP Omie', TRUE, TRUE, 'Demora para compra de inversores e placas causa cancelamento de contratos.', NULL, 'sim_confirmado', 'critica_imediata', NULL, NULL, 'alto', NULL, NOW());

-- 7. ATIVIDADES (activities)
INSERT INTO public.activities (id, opportunity_id, consultant_id, activity_type, summary, result_details, performed_at, next_action, next_action_date) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', 'reuniao', 'Sessão de Pré-Diagnóstico (1h30)', 'Mapeamos o fluxo da carga e o gap de integração WMS-ERP. Identificada dor crítica na conferência.', '2026-08-14T10:00:00Z', 'Apresentar relatório executivo do Pré-Diagnóstico para o Diretor de Operações', '2026-08-16T14:30:00Z'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', 'linkedin', 'Primeiro contato via InMail', 'Roberto respondeu com interesse em rever processos antes da Black Friday.', '2026-08-08T09:00:00Z', 'Agendar call de alinhamento', '2026-08-11T10:00:00Z'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'email', 'Envio da Proposta Comercial de Diagnóstico', 'Proposta enviada no valor de R$ 62k com cronograma de 4 semanas.', '2026-08-12T16:00:00Z', 'Follow-up da proposta com o Diretor Industrial', '2026-08-15T10:00:00Z'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '11111111-1111-1111-1111-111111111111', 'ligacao', 'Tentativa de contato telefônico', 'Secretária informou que o Dr. Renato estava em procedimento cirúrgico.', '2026-08-14T11:30:00Z', 'Retornar ligação para Secretária Executiva', '2026-08-14T17:00:00Z'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '22222222-2222-2222-2222-222222222222', 'reuniao', 'Reunião de Alinhamento Comercial e Negociação de Escopo', 'Fechamos valor em R$ 88.000 em 3 parcelas. Minuta contratual enviada ao jurídico.', '2026-08-13T14:00:00Z', 'Revisão final de cláusula de SLA no contrato jurídico', '2026-08-15T15:00:00Z');

-- ==============================================================================
-- VERIFICAÇÃO RÁPIDA
-- ==============================================================================
-- SELECT 'profiles' AS tabela, COUNT(*) FROM public.profiles
-- UNION ALL SELECT 'companies', COUNT(*) FROM public.companies
-- UNION ALL SELECT 'contacts', COUNT(*) FROM public.contacts
-- UNION ALL SELECT 'opportunities', COUNT(*) FROM public.opportunities
-- UNION ALL SELECT 'qualifications', COUNT(*) FROM public.qualifications
-- UNION ALL SELECT 'activities', COUNT(*) FROM public.activities;