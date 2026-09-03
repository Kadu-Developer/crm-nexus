import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { refreshGoogleAccessToken } from '@/lib/google-tokens';

async function getValidGoogleAccessToken(request: NextRequest, explicitToken?: string, collaboratorId?: string): Promise<string | null> {
  const token = explicitToken || request.cookies.get('google_access_token')?.value;
  const cookieExpiry = request.cookies.get('google_token_expiry')?.value;
  let refreshToken = request.cookies.get('google_refresh_token')?.value;

  // Se o access token for válido e não expirar nos próximos 30s, retorna
  if (token && (!cookieExpiry || new Date(cookieExpiry).getTime() > Date.now() + 30_000)) {
    return token;
  }

  // Se não temos refresh token nos cookies, busca no Supabase
  if (!refreshToken) {
    let query = supabaseAdmin
      .from('calendar_collaborators')
      .select('google_access_token, google_refresh_token, google_token_expiry')
      .not('google_refresh_token', 'is', null);

    if (collaboratorId && collaboratorId !== 'all_team') {
      query = query.eq('id', collaboratorId);
    } else {
      query = query.order('last_sync_at', { ascending: false });
    }

    const { data: collabDb } = await query.limit(1);
    if (collabDb && collabDb.length > 0) {
      refreshToken = collabDb[0].google_refresh_token;
      // Se o access token do banco ainda for válido, aproveita
      if (collabDb[0].google_access_token && collabDb[0].google_token_expiry) {
        if (new Date(collabDb[0].google_token_expiry).getTime() > Date.now() + 30_000) {
          return collabDb[0].google_access_token;
        }
      }
    }
  }

  // Renova com o refresh token
  if (refreshToken) {
    const renewed = await refreshGoogleAccessToken(refreshToken);
    if (renewed?.access_token) {
      const renewedExpiry = new Date(Date.now() + (renewed.expires_in || 3600) * 1000).toISOString();
      await supabaseAdmin.from('calendar_collaborators').update({
        google_access_token: renewed.access_token,
        google_token_expiry: renewedExpiry,
        last_sync_at: new Date().toISOString(),
      }).not('google_refresh_token', 'is', null);

      return renewed.access_token;
    }
  }

  return token || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken: explicitAccessToken,
      collaboratorId,
      calendarId = 'primary',
      title,
      description,
      startTime,
      endTime,
      attendees = [],
      createMeet = true,
    } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const accessToken = await getValidGoogleAccessToken(request, explicitAccessToken, collaboratorId);

    if (accessToken) {
      interface AttendeeInput {
        email: string;
        name?: string;
      }
      interface GoogleEventPayload {
        summary: string;
        description: string;
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
        attendees: { email: string; displayName?: string }[];
        conferenceData?: {
          createRequest: {
            requestId: string;
            conferenceSolutionKey: { type: string };
          };
        };
      }

      const googleEventPayload: GoogleEventPayload = {
        summary: title,
        description: description || '',
        start: { dateTime: startTime, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endTime, timeZone: 'America/Sao_Paulo' },
        attendees: (attendees as AttendeeInput[]).map((a) => ({ email: a.email, displayName: a.name })),
      };

      // Configuração para gerar link do Google Meet automaticamente
      if (createMeet) {
        googleEventPayload.conferenceData = {
          createRequest: {
            requestId: `meet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }

      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
      url.searchParams.set('conferenceDataVersion', '1');

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEventPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Erro ao criar evento no Google Calendar:', errorText);
        return NextResponse.json({ error: 'Erro na API do Google Calendar', details: errorText }, { status: response.status });
      }

      const createdEvent = await response.json();

      let meetUrl = createdEvent.hangoutLink;
      if (!meetUrl && createdEvent.conferenceData?.entryPoints) {
        interface EntryPoint {
          entryPointType: string;
          uri: string;
        }
        const video = (createdEvent.conferenceData.entryPoints as EntryPoint[]).find((e) => e.entryPointType === 'video');
        if (video) meetUrl = video.uri;
      }

      return NextResponse.json({
        success: true,
        googleEventId: createdEvent.id,
        meetUrl: meetUrl || undefined,
        event: createdEvent,
      });
    }

    // Retorno para caso sem token (local)
    return NextResponse.json({
      success: true,
      meetUrl: `https://meet.google.com/nex-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Erro na criação de evento:', err);
    return NextResponse.json({ error: 'Erro interno ao criar evento', message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const calendarId = searchParams.get('calendarId') || 'primary';
    const authHeader = request.headers.get('Authorization');
    const explicitToken = authHeader?.replace('Bearer ', '');

    if (!eventId) {
      return NextResponse.json({ error: 'ID do evento não informado' }, { status: 400 });
    }

    const accessToken = await getValidGoogleAccessToken(request, explicitToken);

    if (accessToken && !eventId.startsWith('evt_') && !eventId.startsWith('crm_opp_')) {
      const googleId = eventId.replace('google_', '');
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleId)}`;

      await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Erro ao excluir evento', message }, { status: 500 });
  }
}
