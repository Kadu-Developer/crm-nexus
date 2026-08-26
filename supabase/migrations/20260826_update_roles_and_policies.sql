-- ==============================================================================
-- NEXUS CRM - UPDATE ROLES AND POLICIES FOR ACCESS CONTROL
-- ==============================================================================

-- 1. UPDATE ENUM TO ADD admin_tech
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'admin_tech';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. UPDATE HANDLE_NEW_USER FUNCTION TO SET ROLES FOR SPECIFIC EMAILS
DROP FUNCTION IF EXISTS public.handle_new_user();
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

  -- Determinar cargo
  IF NEW.email = 'marcel@nexuxflowtech.com.br' THEN
    user_role_val := 'admin_ceo'::public.user_role;
  ELSIF NEW.email IN ('carlos@nexusflowtech.com.br', 'patrikrodrigues@nexusflowtech.com.br') THEN
    user_role_val := 'admin_tech'::public.user_role;
  ELSIF (NEW.raw_user_meta_data->>'role') IN ('admin_ceo', 'admin_tech', 'consultant', 'viewer') THEN
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

-- 3. UPDATE OPPORTUNITY POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Oportunidades visíveis por Dono ou CEO" ON public.opportunities;
DROP POLICY IF EXISTS "Consultores podem criar oportunidades" ON public.opportunities;
DROP POLICY IF EXISTS "Consultor atualiza suas oportunidades" ON public.opportunities;
DROP POLICY IF EXISTS "Apenas CEO pode deletar oportunidades" ON public.opportunities;

-- Create new policies for opportunities
-- Select: consultant can see their own, admin_ceo and admin_tech can see all
CREATE POLICY "Oportunidades visíveis por dono ou admins"
  ON public.opportunities FOR SELECT
  TO authenticated
  USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_ceo', 'admin_tech')
    )
  );

-- Insert: consultant or admin_ceo or admin_tech can insert
CREATE POLICY "Consultores e admins podem criar oportunidades"
  ON public.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_ceo', 'admin_tech')
    )
  );

-- Update:
--   - The consultant themselves can update their own opportunities.
--   - Admin_ceo can update any opportunity (because only Marcel is admin_ceo, and he can update any).
--   - Admin_tech cannot update.
CREATE POLICY "Consultor atualiza suas oportunidades e admin_ceo atualiza qualquer uma"
  ON public.opportunities FOR UPDATE
  TO authenticated
  USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_ceo'
    )
  )
  WITH CHECK (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_ceo'
    )
  );

-- Delete: same as update
CREATE POLICY "Consultor deleta suas oportunidades e admin_ceo deleta qualquer uma"
  ON public.opportunities FOR DELETE
  TO authenticated
  USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_ceo'
    )
  );

-- 4. UPDATE CALENDAR_COLLABORATORS POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Colaboradores visíveis por usuários autenticados" ON public.calendar_collaborators;
DROP POLICY IF EXISTS "Gestão de colaboradores por autenticados ou Admin" ON public.calendar_collaborators;

-- Create new policy for calendar_collaborators SELECT
CREATE POLICY "Colaboradores visíveis por dono ou admins ou pelos três admins específicos"
  ON public.calendar_collaborators FOR SELECT
  TO authenticated
  USING (
    -- Admins (admin_ceo and admin_tech) can see all
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_ceo', 'admin_tech')
    )
    OR
    -- Consultants can see the three specific admins and their own
    (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'consultant'
      )
      AND (
        -- The collaborator's profile is one of the three specific admins
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = calendar_collaborators.profile_id
            AND p.email IN ('carlos@nexusflowtech.com.br','marcel@nexuxflowtech.com.br','patrikrodrigues@nexusflowtech.com.br')
        )
        OR
        -- Or the collaborator is the user's own
        calendar_collaborators.profile_id = auth.uid()
      )
    )
  );

-- For calendar_collaborators, we allow all authenticated to do INSERT, UPDATE, DELETE
CREATE POLICY "Gestão de colaboradores por autenticados"
  ON public.calendar_collaborators FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- 5. UPDATE CALENDAR_EVENTS POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Eventos visíveis por usuários autenticados" ON public.calendar_events;
DROP POLICY IF EXISTS "Gestão de eventos por usuários autenticados" ON public.calendar_events;

-- Select policy for calendar_events
CREATE POLICY "Eventos visíveis por dono ou admins ou pelos três admins específicos"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (
    -- Admins (admin_ceo and admin_tech) can see all
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_ceo', 'admin_tech')
    )
    OR
    -- Consultants can see events of the three specific admins and their own collaborator
    (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'consultant'
      )
      AND (
        -- The event's collaborator is one of the three specific admins
        EXISTS (
          SELECT 1 FROM public.calendar_collaborators cc
          JOIN public.profiles p ON cc.profile_id = p.id
          WHERE cc.id = calendar_events.collaborator_id
            AND p.email IN ('carlos@nexusflowtech.com.br','marcel@nexuxflowtech.com.br','patrikrodrigues@nexusflowtech.com.br')
        )
        OR
        -- Or the event's collaborator is the user's own collaborator
        EXISTS (
          SELECT 1 FROM public.calendar_collaborators cc
          WHERE cc.id = calendar_events.collaborator_id
            AND cc.profile_id = auth.uid()
        )
      )
    )
  );

-- For calendar_events, we allow all authenticated to do INSERT, UPDATE, DELETE
CREATE POLICY "Gestão de eventos por usuários autenticados"
  ON public.calendar_events FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);