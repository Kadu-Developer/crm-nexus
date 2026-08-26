-- ==============================================================================
-- NEXUS CRM - SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (com tratamento para já existentes)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin_ceo', 'consultant', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE segment_type AS ENUM ('industria', 'varejo_ecom', 'servicos', 'tecnologia', 'saude', 'logistica', 'construcao', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE company_size_type AS ENUM ('micro_1_9', 'pequena_10_49', 'media_50_199', 'grande_200_mais');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_source_type AS ENUM ('linkedin', 'instagram', 'indicacao', 'evento', 'outbound', 'parceiro', 'site', 'pre_diagnostico', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_area_type AS ENUM ('diretoria_clevel', 'comercial', 'operacoes', 'ti_sistemas', 'financeiro', 'rh', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pipeline_stage_type AS ENUM (
      'lead_identificado', 'primeiro_contato', 'contato_realizado',
      'pre_diag_agendado', 'pre_diag_realizado', 'qualificado',
      'diag_proposto', 'diag_contratado', 'diag_realizado',
      'solucao_identificada', 'proposta_enviada', 'negociacao',
      'fechado_ganho', 'fechado_perdido'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES (Vinculado ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'consultant',
  avatar_url TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  password_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT,
  website TEXT,
  segment segment_type NOT NULL DEFAULT 'industria',
  state VARCHAR(2) NOT NULL DEFAULT 'SP',
  city TEXT NOT NULL DEFAULT 'São Paulo',
  company_size company_size_type NOT NULL DEFAULT 'media_50_199',
  employee_count INT,
  estimated_revenue_tier TEXT,
  lead_source lead_source_type NOT NULL DEFAULT 'linkedin',
  assigned_consultant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_title TEXT,
  area contact_area_type NOT NULL DEFAULT 'diretoria_clevel',
  phone TEXT,
  email TEXT,
  linkedin_url TEXT,
  is_decision_maker BOOLEAN NOT NULL DEFAULT FALSE,
  decision_influence TEXT NOT NULL DEFAULT 'alta',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. OPPORTUNITIES
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stage pipeline_stage_type NOT NULL DEFAULT 'lead_identificado',
  lost_reason TEXT,
  solution_service TEXT NOT NULL DEFAULT 'Diagnóstico Nexus',
  estimated_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  proposed_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  probability INT NOT NULL DEFAULT 5,
  weighted_revenue NUMERIC(12,2) GENERATED ALWAYS AS (proposed_value * (probability::numeric / 100.0)) STORED,
  estimated_commission NUMERIC(12,2) DEFAULT 0,
  estimated_close_date DATE,
  score INT NOT NULL DEFAULT 0,
  next_action_description TEXT NOT NULL,
  next_action_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- 7. QUALIFICATIONS
CREATE TABLE IF NOT EXISTS public.qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL UNIQUE REFERENCES public.opportunities(id) ON DELETE CASCADE,
  main_problem TEXT,
  impacted_area TEXT,
  current_workflow TEXT,
  current_systems TEXT,
  uses_spreadsheets_manual BOOLEAN DEFAULT FALSE,
  has_unintegrated_systems BOOLEAN DEFAULT FALSE,
  main_bottleneck TEXT,
  estimated_impact_cost TEXT,
  has_budget TEXT DEFAULT 'desconhecido',
  urgency_level TEXT DEFAULT 'media',
  desired_timeline TEXT,
  competitor_supplier TEXT,
  opportunity_potential TEXT DEFAULT 'medio',
  consultant_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVITIES
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  result_details TEXT NOT NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  next_action TEXT,
  next_action_date TIMESTAMPTZ
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Helper: Verifica se o usuário autenticado é admin_ceo
CREATE OR REPLACE FUNCTION public.is_admin_ceo()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin_ceo'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- REGRAS RLS PARA PROFILES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles são visíveis por usuários autenticados" ON public.profiles;
CREATE POLICY "Profiles são visíveis por usuários autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuário atualiza seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin_ceo());

-- ------------------------------------------------------------------------------
-- REGRAS RLS PARA OPPORTUNITIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Oportunidades visíveis por Dono ou CEO" ON public.opportunities;
CREATE POLICY "Oportunidades visíveis por Dono ou CEO"
  ON public.opportunities FOR SELECT
  TO authenticated
  USING (
    consultant_id = auth.uid() 
    OR public.is_admin_ceo()
  );

DROP POLICY IF EXISTS "Consultores podem criar oportunidades" ON public.opportunities;
CREATE POLICY "Consultores podem criar oportunidades"
  ON public.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    consultant_id = auth.uid() OR public.is_admin_ceo()
  );

DROP POLICY IF EXISTS "Consultor atualiza suas oportunidades" ON public.opportunities;
CREATE POLICY "Consultor atualiza suas oportunidades"
  ON public.opportunities FOR UPDATE
  TO authenticated
  USING (consultant_id = auth.uid() OR public.is_admin_ceo())
  WITH CHECK (consultant_id = auth.uid() OR public.is_admin_ceo());

DROP POLICY IF EXISTS "Apenas CEO pode deletar oportunidades" ON public.opportunities;
CREATE POLICY "Apenas CEO pode deletar oportunidades"
  ON public.opportunities FOR DELETE
  TO authenticated
  USING (public.is_admin_ceo());

-- ------------------------------------------------------------------------------
-- REGRAS RLS PARA COMPANIES & CONTACTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Empresas visíveis por autenticados" ON public.companies;
CREATE POLICY "Empresas visíveis por autenticados"
  ON public.companies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Contatos visíveis por autenticados" ON public.contacts;
CREATE POLICY "Contatos visíveis por autenticados"
  ON public.contacts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- REGRAS RLS PARA QUALIFICATIONS & ACTIVITIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Qualificações gerenciadas pelo responsável ou CEO" ON public.qualifications;
CREATE POLICY "Qualificações gerenciadas pelo responsável ou CEO"
  ON public.qualifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = qualifications.opportunity_id
      AND (o.consultant_id = auth.uid() OR public.is_admin_ceo())
    )
  );

DROP POLICY IF EXISTS "Atividades gerenciadas pelo responsável ou CEO" ON public.activities;
CREATE POLICY "Atividades gerenciadas pelo responsável ou CEO"
  ON public.activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = activities.opportunity_id
      AND (o.consultant_id = auth.uid() OR public.is_admin_ceo())
    )
  );

-- Trigger para criar perfil automaticamente no SignUp do Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val public.user_role;
  user_name_val text;
BEGIN
  -- Determinar nome
  user_name_val := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Determinar cargo (admin_ceo para emails chave, ou o que vier no metadata)
  IF NEW.email IN ('carlos@nexusflowtech.com.br', 'diretoria@nexus.com.br', 'kaduesr@gmail.com') THEN
    user_role_val := 'admin_ceo'::public.user_role;
  ELSIF (NEW.raw_user_meta_data->>'role') IN ('admin_ceo', 'consultant', 'viewer') THEN
    user_role_val := (NEW.raw_user_meta_data->>'role')::public.user_role;
  ELSE
    user_role_val := 'consultant'::public.user_role;
  END IF;

  -- Inserir ou atualizar na tabela profiles (novo usuário inicia com must_change_password = true)
  INSERT INTO public.profiles (id, name, email, role, avatar_url, must_change_password)
  VALUES (
    NEW.id,
    user_name_val,
    NEW.email,
    user_role_val,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    TRUE
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erro ao criar profile para %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
