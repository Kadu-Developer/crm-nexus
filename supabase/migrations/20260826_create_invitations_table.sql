-- ==============================================================================
-- INVITATIONS TABLE FOR CONSULTANT ONBOARDING
-- ==============================================================================

-- 1. Ensure admin_tech exists in user_role
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'admin_tech';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CREATE INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'consultant',
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    used_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- 4. ENABLE RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
DROP POLICY IF EXISTS "Admins podem gerenciar convites" ON public.invitations;
CREATE POLICY "Admins podem gerenciar convites"
    ON public.invitations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role::text IN ('admin_ceo', 'admin_tech')
        )
    );

DROP POLICY IF EXISTS "Qualquer um pode ler convites por token" ON public.invitations;
CREATE POLICY "Qualquer um pode ler convites por token"
    ON public.invitations
    FOR SELECT
    TO anon, authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Usuários podem atualizar convite ao se registrar" ON public.invitations;
CREATE POLICY "Usuários podem atualizar convite ao se registrar"
    ON public.invitations
    FOR UPDATE
    TO anon, authenticated
    USING (TRUE)
    WITH CHECK (TRUE);