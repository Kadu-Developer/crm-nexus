import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateStr = searchParams.get('state');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/calendar/callback`;

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}?calendar_error=${encodeURIComponent(error || 'Autorização cancelada')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}?calendar_error=Credenciais_Google_Nao_Configuradas`);
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
      return NextResponse.redirect(`${appUrl}?calendar_error=Falha_na_autenticacao_Google`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // 2. Obter informações de perfil do Google
    const userinfoResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let googleProfile = { email: '', name: '', picture: '' };
    if (userinfoResponse.ok) {
      googleProfile = await userinfoResponse.json();
    }

    // 3. Montar dados para o cliente
    const collaboratorData = {
      email: googleProfile.email,
      name: googleProfile.name,
      avatar: googleProfile.name ? googleProfile.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : 'G',
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
    };

    // Redireciona com dados codificados para que o frontend persista de imediato
    const state = stateStr ? JSON.parse(stateStr) : {};
    const redirectPath = state.redirectPath || '/';

    const redirectUrl = new URL(redirectPath, appUrl);
    redirectUrl.searchParams.set('google_connected', 'true');
    redirectUrl.searchParams.set('email', collaboratorData.email);
    redirectUrl.searchParams.set('name', collaboratorData.name);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Erro no callback do Google Calendar:', err);
    return NextResponse.redirect(`${appUrl}?calendar_error=Erro_interno_no_servidor`);
  }
}
