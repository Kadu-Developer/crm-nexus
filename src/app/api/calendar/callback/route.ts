import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateStr = searchParams.get('state');

  const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${origin}/api/calendar/callback`;

  if (error || !code) {
    return NextResponse.redirect(`${origin}?calendar_error=${encodeURIComponent(error || 'Autorização cancelada')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}?calendar_error=Credenciais_Google_Nao_Configuradas`);
  }

  try {
    // 1. Trocar código de autorização por Access Token e Refresh Token
    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('Erro na troca de tokens do Google:', errBody);
      return NextResponse.redirect(`${origin}?calendar_error=Falha_na_autenticacao_Google`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    const tokenExpiry = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString();

    // 2. Obter informações de perfil do Google
    const userinfoResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let googleProfile = { email: '', name: '', picture: '' };
    if (userinfoResponse.ok) {
      googleProfile = await userinfoResponse.json();
    }

    const userEmail = (googleProfile.email || 'carlos@nexusflowtech.com.br').toLowerCase().trim();
    const userName = googleProfile.name || 'Carlos Eduardo';

    const state = stateStr ? JSON.parse(stateStr) : {};
    let collabId = state.collaboratorId || '';

    if (!collabId) {
      // Tenta localizar por e-mail no banco
      const { data: existingCollabs } = await supabaseAdmin
        .from('calendar_collaborators')
        .select('id, name, role_title, department, avatar, color')
        .eq('email', userEmail)
        .limit(1);

      if (existingCollabs && existingCollabs.length > 0) {
        collabId = existingCollabs[0].id;
      } else if (userEmail.includes('marcel')) {
        collabId = 'collab_marcel';
      } else if (userEmail.includes('patrik')) {
        collabId = 'collab_patrik';
      } else {
        collabId = 'collab_carlos';
      }
    }

    // 3. Salvar / Atualizar colaborador com Google conectado (DEVE ser antes dos eventos devido à FK)
    const { error: collaboratorError } = await supabaseAdmin.from('calendar_collaborators').upsert({
      id: collabId,
      name: userName,
      email: userEmail,
      role_title: collabId === 'collab_marcel' ? 'Founder & CEO / CFO' : collabId === 'collab_patrik' ? 'CTO & IA' : 'Tech Lead & Engenharia',
      department: collabId === 'collab_marcel' ? 'executivo' : 'engenharia',
      avatar: userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'CR',
      color: collabId === 'collab_marcel' ? '#f59e0b' : collabId === 'collab_patrik' ? '#8b5cf6' : '#0284c7',
      google_calendar_id: userEmail,
      google_connected: true,
      sync_status: 'synced',
      last_sync_at: new Date().toISOString(),
      google_access_token: access_token,
      google_refresh_token: refresh_token || null,
      google_token_expiry: tokenExpiry,
      is_visible: true,
    });

    if (collaboratorError) {
      console.error('Erro ao salvar colaborador no Supabase:', collaboratorError.message);
    }

    // 5. Redirecionar imediatamente para o CRM. A sincronização dos eventos é feita
    //    pelo front-end chamando /api/calendar/sync, evitando segurar a resposta e
    //    estourar o timeout das funções serverless da Vercel.
    const redirectPath = state.redirectPath || '/?view=calendar';

    const redirectUrl = new URL(redirectPath, origin);
    redirectUrl.searchParams.set('google_connected', 'true');
    redirectUrl.searchParams.set('email', userEmail);
    redirectUrl.searchParams.set('view', 'calendar');

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Google Agenda Conectada</title>
  <style>
    body {
      background: #090d16;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
      padding: 1.5rem;
    }
    .card {
      background: #1e293b;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #334155;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
      max-width: 380px;
      width: 100%;
    }
    .icon {
      font-size: 2.5rem;
      color: #22c55e;
      margin-bottom: 0.75rem;
    }
    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 800;
    }
    p {
      margin: 0;
      font-size: 0.875rem;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h2>Google Agenda Conectada!</h2>
    <p>Sincronizando eventos... Você já pode voltar para sua tela.</p>
  </div>
  <script>
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', email: ${JSON.stringify(userEmail)} }, '*');
        setTimeout(function() {
          window.close();
        }, 400);
      } else {
        window.location.replace(${JSON.stringify(redirectUrl.toString())});
      }
    } catch (e) {
      window.location.replace(${JSON.stringify(redirectUrl.toString())});
    }
  </script>
</body>
</html>`;

    const response = new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

    // Configurar cookies de autenticação do Google
    response.cookies.set('google_access_token', access_token, {
      path: '/',
      maxAge: expires_in || 3600,
      sameSite: 'lax',
    });

    // Persistir o refresh token em cookie (longa duração) para renovar o access token automaticamente
    if (refresh_token) {
      response.cookies.set('google_refresh_token', refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        sameSite: 'lax',
        httpOnly: true,
      });
    }

    response.cookies.set('google_token_expiry', tokenExpiry, {
      path: '/',
      maxAge: expires_in || 3600,
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Erro no callback do Google Calendar:', err);
    return NextResponse.redirect(`${origin}?calendar_error=Erro_interno_no_servidor`);
  }
}
