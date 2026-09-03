-- ==============================================================================
-- NEXUS CRM - FIX OPPORTUNITY DELETE AND UPDATE POLICIES FOR ADMIN_TECH
-- ==============================================================================

-- Drop existing update and delete policies
DROP POLICY IF EXISTS "Consultor atualiza suas oportunidades e admin_ceo atualiza qualquer uma" ON public.opportunities;
DROP POLICY IF EXISTS "Consultor deleta suas oportunidades e admin_ceo deleta qualquer uma" ON public.opportunities;
DROP POLICY IF EXISTS "Consultor atualiza suas oportunidades e admins atualizam qualquer uma" ON public.opportunities;
DROP POLICY IF EXISTS "Consultor deleta suas oportunidades e admins deletam qualquer uma" ON public.opportunities;

-- Create updated policies allowing both admin_ceo and admin_tech to UPDATE and DELETE
CREATE POLICY "Consultor atualiza suas oportunidades e admins atualizam qualquer uma"
  ON public.opportunities FOR UPDATE
  TO authenticated
  USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
    )
  )
  WITH CHECK (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
    )
  );

CREATE POLICY "Consultor deleta suas oportunidades e admins deletam qualquer uma"
  ON public.opportunities FOR DELETE
  TO authenticated
  USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
    )
  );
