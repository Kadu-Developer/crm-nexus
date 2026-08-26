-- ==============================================================================
-- NEXUS CRM - SUGGESTIONS TABLE & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. CREATE SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  admin_response TEXT,
  responded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE RLS
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES (IF ANY)
DROP POLICY IF EXISTS "Sugestões visíveis por autor ou admins" ON public.suggestions;
DROP POLICY IF EXISTS "Consultores e admins podem criar sugestões" ON public.suggestions;
DROP POLICY IF EXISTS "Atualização de sugestões por autor ou admins" ON public.suggestions;
DROP POLICY IF EXISTS "Exclusão de sugestões por autor ou admins" ON public.suggestions;

-- 4. POLICIES
-- SELECT: Consultant can see their own, admins (admin_ceo and admin_tech) can see all
CREATE POLICY "Sugestões visíveis por autor ou admins"
  ON public.suggestions FOR SELECT
  TO authenticated
  USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
    )
  );

-- INSERT: Any authenticated user can insert with their consultant_id
CREATE POLICY "Consultores e admins podem criar sugestões"
  ON public.suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
    )
  );

-- UPDATE:
-- Author can update title and description if status is 'pending'.
-- Admins can update any suggestion (e.g. response and status).
CREATE POLICY "Atualização de sugestões por autor ou admins"
  ON public.suggestions FOR UPDATE
  TO authenticated
  USING (
    (consultant_id = auth.uid() AND status = 'pending')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
    )
  )
  WITH CHECK (
    (consultant_id = auth.uid() AND status = 'pending')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
    )
  );

-- DELETE:
-- Author can delete if status is 'pending'.
-- Admins can delete any suggestion.
CREATE POLICY "Exclusão de sugestões por autor ou admins"
  ON public.suggestions FOR DELETE
  TO authenticated
  USING (
    (consultant_id = auth.uid() AND status = 'pending')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
    )
  );

-- 5. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_suggestions_updated_at ON public.suggestions;
CREATE TRIGGER tr_suggestions_updated_at
  BEFORE UPDATE ON public.suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_suggestions_updated_at();
