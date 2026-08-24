-- ==============================================================================
-- NEXUS CRM - CALENDAR & GOOGLE WORKSPACE INTEGRATION TABLES
-- ==============================================================================

-- 1. ENUM DE DEPARTAMENTOS
DO $$ BEGIN
    CREATE TYPE department_type AS ENUM ('executivo', 'comercial', 'engenharia', 'produto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA DE COLABORADORES DO CALENDÁRIO
CREATE TABLE IF NOT EXISTS public.calendar_collaborators (
  id TEXT PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role_title TEXT NOT NULL DEFAULT 'Colaborador',
  department department_type NOT NULL DEFAULT 'comercial',
  avatar TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#0284c7',
  google_calendar_id TEXT NOT NULL,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMPTZ,
  google_connected BOOLEAN NOT NULL DEFAULT FALSE,
  sync_status TEXT NOT NULL DEFAULT 'disconnected', -- 'synced' | 'syncing' | 'error' | 'disconnected'
  last_sync_at TIMESTAMPTZ,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE EVENTOS DO CALENDÁRIO
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  collaborator_id TEXT NOT NULL REFERENCES public.calendar_collaborators(id) ON DELETE CASCADE,
  additional_collaborator_ids TEXT[] DEFAULT '{}',
  category_id TEXT NOT NULL DEFAULT 'crm_diagnostico',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  meet_url TEXT,
  location TEXT,
  attendees JSONB DEFAULT '[]'::jsonb,
  
  -- Vínculo com CRM
  linked_opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  opportunity_title TEXT,
  opportunity_company_name TEXT,
  opportunity_score INT,
  stage_title TEXT,
  
  -- Google Calendar Sync Data
  google_event_id TEXT,
  google_calendar_id TEXT,
  google_i_cal_uid TEXT,
  google_etag TEXT,
  recurrence TEXT DEFAULT 'none',
  source TEXT NOT NULL DEFAULT 'google_calendar', -- 'google_calendar' | 'crm_nexus' | 'manual'
  status TEXT NOT NULL DEFAULT 'confirmed',       -- 'confirmed' | 'tentative' | 'cancelled'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE CONFIGURAÇÕES GERAIS DO GOOGLE WORKSPACE
CREATE TABLE IF NOT EXISTS public.calendar_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_settings',
  domain TEXT NOT NULL DEFAULT 'nexusflow.com.br',
  domain_wide_sync BOOLEAN NOT NULL DEFAULT TRUE,
  auto_sync_interval_minutes INT NOT NULL DEFAULT 15,
  sync_crm_diagnosticos BOOLEAN NOT NULL DEFAULT TRUE,
  webhook_url TEXT,
  google_client_id TEXT,
  google_client_secret TEXT,
  service_account_configured BOOLEAN NOT NULL DEFAULT FALSE,
  last_global_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_collab ON public.calendar_events(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_opp ON public.calendar_events(linked_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_google_id ON public.calendar_events(google_event_id);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.calendar_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de Colaboradores
CREATE POLICY "Colaboradores visíveis por usuários autenticados"
  ON public.calendar_collaborators FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Gestão de colaboradores por autenticados ou Admin"
  ON public.calendar_collaborators FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Políticas de Eventos
CREATE POLICY "Eventos visíveis por usuários autenticados"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Gestão de eventos por usuários autenticados"
  ON public.calendar_events FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Políticas de Configurações
CREATE POLICY "Acesso a configurações do Google por autenticados"
  ON public.calendar_settings FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- 7. TRIGGER DE ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMP
CREATE OR REPLACE FUNCTION update_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_calendar_collaborators_updated_at ON public.calendar_collaborators;
CREATE TRIGGER tr_calendar_collaborators_updated_at
  BEFORE UPDATE ON public.calendar_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

DROP TRIGGER IF EXISTS tr_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER tr_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();
