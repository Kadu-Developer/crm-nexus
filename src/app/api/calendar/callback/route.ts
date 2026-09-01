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

    // 3. Salvar / Atualizar colaborador com Google conectado (DEVE ser antes dos eventos devido à FK)
    const { error: collaboratorError } = await supabaseAdmin.from('calendar_collaborators').upsert({
      id: 'collab_carlos',
      name: userName,
      email: userEmail,
      role_title: 'Diretor / CTO',
      department: 'executivo',
      avatar: 'CE',
      color: '#0284c7',
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

    // 4. Buscar eventos reais do Google Calendar imediatamente
    let syncedEventsCount = 0;
    try {
      const minTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const maxTime = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

      const calUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      calUrl.searchParams.set('timeMin', minTime);
      calUrl.searchParams.set('timeMax', maxTime);
      calUrl.searchParams.set('singleEvents', 'true');
      calUrl.searchParams.set('orderBy', 'startTime');
      calUrl.searchParams.set('maxResults', '250');

      const calRes = await fetch(calUrl.toString(), {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json',
        },
      });

      if (calRes.ok) {
        const calData = await calRes.json();
        const items = calData.items || [];
        syncedEventsCount = items.length;

        // Salvar eventos na tabela calendar_events do Supabase
        for (const item of items) {
          const startTime = item.start?.dateTime || item.start?.date || new Date().toISOString();
          const endTime = item.end?.dateTime || item.end?.date || new Date(new Date(startTime).getTime() + 3600000).toISOString();

          let meetUrl = item.hangoutLink;
          if (!meetUrl && item.conferenceData?.entryPoints) {
            const videoEntry = item.conferenceData.entryPoints.find((ep: any) => ep.entryPointType === 'video');
            if (videoEntry) meetUrl = videoEntry.uri;
          }

          const { error: eventError } = await supabaseAdmin.from('calendar_events').upsert({
            id: `google_${item.id}`,
            google_event_id: item.id,
            title: item.summary || '(Sem título)',
            description: item.description || '',
            location: item.location || '',
            start_time: startTime,
            end_time: endTime,
            is_all_day: !item.start?.dateTime && !!item.start?.date,
            meet_url: meetUrl || null,
            collaborator_id: 'collab_carlos',
            category_id: 'tech_alignment',
            source: 'google_calendar',
            status: item.status === 'cancelled' ? 'cancelled' : 'confirmed',
            updated_at: new Date().toISOString(),
          });

          if (eventError) {
            console.error(`Erro ao salvar evento ${item.id} no Supabase:`, eventError.message);
          }
        }
      }
    } catch (fetchErr) {
      console.warn('Erro ao buscar eventos durante o callback:', fetchErr);
    }

    // 5. Redirecionar para o CRM com cookies e status de sucesso
    const state = stateStr ? JSON.parse(stateStr) : {};
    const redirectPath = state.redirectPath || '/';

    const redirectUrl = new URL(redirectPath, origin);
    redirectUrl.searchParams.set('google_connected', 'true');
    redirectUrl.searchParams.set('email', userEmail);
    redirectUrl.searchParams.set('synced_count', String(syncedEventsCount));

    const response = NextResponse.redirect(redirectUrl.toString());

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
