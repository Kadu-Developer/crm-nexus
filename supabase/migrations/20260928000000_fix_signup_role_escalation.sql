-- ==============================================================================
-- CORREÇÃO: escalada de privilégio no cadastro (signup)
-- ==============================================================================
-- O trigger anterior aceitava `raw_user_meta_data->>'role'` como fonte de
-- verdade do cargo. Como `signUp` é público e aceita `options.data`
-- arbitrário, qualquer cliente podia escrever:
--
--   POST /auth/v1/signup
--   { "email": "qualquer@dominio-qualquer.com",
--     "password": "...",
--     "data": { "role": "admin_tech" } }
--
-- e o trigger gravava `profiles.role = 'admin_tech'`. O cargo de admin vinha
-- por ALLOWLIST de e-mail nas linhas acima do `ELSIF` — a lista continuava
-- valendo, mas deixava de ser a única porta: qualquer um abria a segunda.
--
-- `admin_tech` é a chave de quase tudo: lê e escreve em `invitations`
-- (política "Admins podem gerenciar convites"), o que encadeia convite →
-- admin novo → convite. A escalada fecha aí.
--
-- A checagem de domínio em `src/app/register/page.tsx` NÃO é defesa: roda no
-- navegador e é contornável chamando a API REST do Auth direto. Isto aqui é
-- a barreira real.
--
-- A correção NÃO remove a capacidade de convidar admin: o registro legítimo
-- continua funcionando. Muda apenas DE QUEM o cargo é lido. De metadata do
-- próprio usuário (forjável) para a tabela `invitations`, que só um admin
-- escreve e que a RLS já restringe.
--
-- Nota sobre `SECURITY DEFINER`: o trigger já é SECURITY DEFINER, então a
-- leitura de `invitations` abaixo contorna a RLS da tabela — é intencional e
-- necessário, porque no momento do INSERT o usuário ainda não tem profile e
-- por consequência não satisfaz nenhuma política que dependa de
-- `auth.uid()`.

-- 1. ATUALIZAR A FUNÇÃO DO TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val public.user_role;
  user_name_val text;
  invited_role text;
BEGIN
  -- Determinar nome (inalterado: 'name' e 'full_name' são texto livre e
  -- não concedem nada).
  user_name_val := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Convite válido para este e-mail?
  --
  -- As três condições andam juntas de propósito. Um convite aceito
  -- (`used_at`/`status`) não concede nada: sem isto, o primeiro registro que
  -- usasse o token — inclusive um atacante que o roubasse — continuaria
  -- válido para sempre. E `expires_at` compara com `NOW()` no próprio
  -- trigger, porque a janela de 7 dias da tabela não é verificada por nada.
  --
  -- O e-mail compara em LOWER dos dois lados: `signUp` normaliza o domínio
  -- mas não o local, e uma diferença de caixa seria uma falha silenciosa — o
  -- convite válido seria recusado e o admin cairia em 'consultant', que é o
  -- modo de falha mais caro de depurar (convite aceito, privilégio
  -- ausente).
  SELECT i.role INTO invited_role
  FROM public.invitations i
  WHERE LOWER(i.email) = LOWER(NEW.email)
    AND i.status = 'pending'
    AND i.used_at IS NULL
    AND i.expires_at > NOW()
  ORDER BY i.expires_at DESC
  LIMIT 1;

  -- Determinar cargo, por ordem de precedência estrita:
  --
  --   1. allowlist de e-mail dos administradores — inalterada
  --   2. convite válido e não usado — NOVA fonte de verdade
  --   3. consultant — o padrão
  --
  -- O que sumiu é o `ELSIF` que lia `raw_user_meta_data->>'role'`. Ele era a
  -- porta: escrita pelo próprio usuário no momento do cadastro.
  IF LOWER(NEW.email) IN ('marcel@nexusflowtech.com.br', 'marcel@nexuxflowtech.com.br') THEN
    user_role_val := 'admin_ceo'::public.user_role;
  ELSIF LOWER(NEW.email) IN ('carlos@nexusflowtech.com.br', 'patrikrodrigues@nexusflowtech.com.br') THEN
    user_role_val := 'admin_tech'::public.user_role;
  ELSIF invited_role IS NOT NULL
    AND invited_role IN ('admin_ceo', 'admin_tech', 'consultant', 'viewer') THEN
    -- O valor do convite passa pelo mesmo allowlist. A coluna é TEXT sem
    -- CHECK, então um admin poderia ter gravado qualquer string; o cast
    -- direto para `user_role` quebraria o INSERT do profile.
    user_role_val := invited_role::public.user_role;
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

-- 2. REPARAR OS PERFIS JÁ ESCALADOS
--
-- O `CREATE OR REPLACE` acima reescreve a função, mas não toca nos profiles que
-- já existem: quem se cadastrou antes desta correção com metadata forjado
-- continua com o cargo. Sem esta seção, a migração fecha a porta para os
-- próximos cadastros e deixa aberta para o passado.
--
-- A assinatura do ataque é esta: metadata forjado NÃO cria linha em
-- `invitations`. Um admin legítimo sempre tem um convite — criado por outro
-- admin, e o INSERT em `invitations` é restrito a `admin_ceo`/`admin_tech` pela
-- política "Admins podem gerenciar convites" (20260826:34-49). Então
-- "admin sem convite para aquele e-mail" isola o escalado do convidado.
--
-- O filtro NÃO olha `status`, `used_at` nem `expires_at` de propósito:
-- `register/page.tsx:115-122` marca o convite como `accepted` DEPOIS do signup,
-- então quem se cadastrou por convite legítimo já tem um convite aceito. Checar
-- as três condições (como a função faz, para o caminho novo) rejeitaria aqui um
-- admin legítimo e o rebaixaria sem que ninguém perceiveu.
--
-- `role` é um enum nativo (`CREATE TYPE user_role`), então a coluna não consegue
-- conter valor fora do contrato: um `role NOT IN (...)` casaria zero linhas e
-- pareceria ter reparado sem reipar nada. O alvo é o cargo válido demais —
-- `admin_ceo`/`admin_tech` sem origem autorizante.

DO $$
DECLARE
  alvos text;
  total int;
BEGIN
  -- A lista vai para o log da migração: se ela estiver vazia, não havia
  -- ninguém escalado e nenhuma conta legítima foi rebaixada. Se não estiver,
  -- os e-mails estão nomeados e a rebaixada é reversível à mão.
  SELECT string_agg(p.email, ', ')
  INTO alvos
  FROM public.profiles p
  WHERE p.role::text IN ('admin_ceo', 'admin_tech')
    AND LOWER(p.email) NOT IN (
      'marcel@nexusflowtech.com.br',
      'marcel@nexuxflowtech.com.br',
      'carlos@nexusflowtech.com.br',
      'patrikrodrigues@nexusflowtech.com.br'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.invitations i WHERE LOWER(i.email) = LOWER(p.email)
    );

  SELECT count(*) INTO total
  FROM public.profiles p
  WHERE p.role::text IN ('admin_ceo', 'admin_tech')
    AND LOWER(p.email) NOT IN (
      'marcel@nexusflowtech.com.br',
      'marcel@nexuxflowtech.com.br',
      'carlos@nexusflowtech.com.br',
      'patrikrodrigues@nexusflowtech.com.br'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.invitations i WHERE LOWER(i.email) = LOWER(p.email)
    );

  RAISE NOTICE 'perfis admin sem convite autorizante: %', COALESCE(alvos, '(nenhum)');
END $$;

UPDATE public.profiles p
SET role = 'consultant'
WHERE p.role::text IN ('admin_ceo', 'admin_tech')
  AND LOWER(p.email) NOT IN (
    'marcel@nexusflowtech.com.br',
    'marcel@nexuxflowtech.com.br',
    'carlos@nexusflowtech.com.br',
    'patrikrodrigues@nexusflowtech.com.br'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.invitations i WHERE LOWER(i.email) = LOWER(p.email)
  );
