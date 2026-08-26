-- Create invitations table for consultant invitation system
-- This table supports the feature requested by the user to generate invite links for consultants
-- Importers: AdminInvitesPage component, RegisterPage component
-- Affected API: Supabase invitations table
-- Data schema: id (UUID), email (text), role (user_role), invited_by (UUID -> profiles), token (text), timestamps, status
-- User verbatim instruction: "Preciso criar também um envio de convite para os consultores! O Marcel vai gerar um link qe o consultor vai se cadastrar para começar a usar"

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'consultant',
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    used_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies for invitations
-- Admins can do everything
CREATE POLICY "Admins podem gerenciar convites"
    ON public.invitations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin_ceo', 'admin_tech')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin_ceo', 'admin_tech')
        )
    );

-- Unauthenticated users (during registration) can select invitations by token
CREATE POLICY "Qualquer um pode ler convites por token"
    ON public.invitations
    FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Unauthenticated users can update invitation status during registration
CREATE POLICY "Usuários podem atualizar convite ao se registrar"
    ON public.invitations
    FOR UPDATE
    TO anon, authenticated
    USING (TRUE)
    WITH CHECK (TRUE);