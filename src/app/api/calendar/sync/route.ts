import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { refreshGoogleAccessToken } from '@/lib/google-tokens';

interface GoogleAttendee {
  displayName?: string;
  email: string;
  responseStatus?: string;
}

interface GoogleEntryPoint {
  entryPointType?: string;
  uri?: string;
}

interface GoogleCalendarItem {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  hangoutLink?: string;
  conferenceData?: { entryPoints?: GoogleEntryPoint[] };
  attendees?: GoogleAttendee[];
  recurrence?: string[];
  status?: string;
  created?: string;
  updated?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieToken = request.cookies.get('google_access_token')?.value;
    const cookieExpiry = request.cookies.get('google_token_expiry')?.value;
    let refreshToken = body.refreshToken || request.cookies.get('google_refresh_token')?.value;
    const { calendarId = 'primary', timeMin, timeMax } = body;

    let targetCollabId: string = body.collaboratorId || 'collab_carlos';
    let accessToken: string | undefined = body.accessToken || cookieToken;
    let renewedAccessToken: string | null = null;
    let renewedExpiry: string | null = null;

    // Se o access token ou refresh token não vieram na requisição, busca o token ativo salvo no banco de dados
    if (!refreshToken || !accessToken) {
      const { data: collabDb } = await supabaseAdmin
        .from('calendar_collaborators')
        .select('id, google_access_token, google_refresh_token, google_token_expiry')
        .not('google_refresh_token', 'is', null)
        .order('last_sync_at', { ascending: false })
        .limit(1);

      if (collabDb && collabDb.length > 0) {
        const activeCollab = collabDb[0];
        targetCollabId = body.collaboratorId || activeCollab.id;
        if (!refreshToken && activeCollab.google_refresh_token) {
          refreshToken = activeCollab.google_refresh_token;
        }
        if (!accessToken && activeCollab.google_access_token && activeCollab.google_token_expiry) {
          const expTime = new Date(activeCollab.google_token_expiry).getTime();
          if (expTime > Date.now() + 30_000) {
            accessToken = activeCollab.google_access_token;
          }
        }
      }
    }

    // Se o access token estiver ausente ou expirado, renova com o refresh token
    if (!accessToken || (cookieExpiry && Date.now() > new Date(cookieExpiry).getTime() - 30_000)) {
      if (refreshToken) {
        const renewed = await refreshGoogleAccessToken(refreshToken);
        if (renewed?.access_token) {
          accessToken = renewed.access_token;
          renewedAccessToken = renewed.access_token;
          renewedExpiry = new Date(Date.now() + (renewed.expires_in || 3600) * 1000).toISOString();

          // Atualiza o colaborador com os novos tokens no banco
          await supabaseAdmin.from('calendar_collaborators').update({
            google_access_token: renewed.access_token,
            google_token_expiry: renewedExpiry,
            last_sync_at: new Date().toISOString(),
          }).eq('id', targetCollabId);
        }
      }
    }

    // Se um access_token foi fornecido ou está nos cookies, busca os eventos reais diretamente da API do Google Calendar v3
    if (accessToken) {
      // Pega os últimos 7 dias e os próximos 60 dias para cobrir passado recente, hoje e futuro
      const minTime = timeMin || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const maxTime = timeMax || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

      let pageToken: string | null = null;
      let googleItems: GoogleCalendarItem[] = [];
      let pageCount = 0;

      do {
        const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
        url.searchParams.set('timeMin', minTime);
        url.searchParams.set('timeMax', maxTime);
        url.searchParams.set('singleEvents', 'true');
        url.searchParams.set('orderBy', 'startTime');
        url.searchParams.set('maxResults', '250');
        if (pageToken) {
          url.searchParams.set('pageToken', pageToken);
        }

        const apiRes = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });

        if (!apiRes.ok) {
          const errText = await apiRes.text();
          console.warn('Google Calendar API error response:', errText);
          if (googleItems.length === 0) {
            return NextResponse.json({
              error: 'Falha ao buscar eventos do Google Calendar',
              details: errText,
            }, { status: apiRes.status });
          }
          break;
        }

        const data = await apiRes.json();
        const items = (data.items || []) as GoogleCalendarItem[];
        googleItems = googleItems.concat(items);
        pageToken = data.nextPageToken || null;
        pageCount++;
      } while (pageToken && pageCount < 8);

      // Mapear eventos do Google para o modelo CalendarEvent do CRM Nexus
      const mappedEvents = googleItems.map((item) => {
        const startTime = item.start?.dateTime || item.start?.date || new Date().toISOString();
        const endTime = item.end?.dateTime || item.end?.date || new Date(new Date(startTime).getTime() + 3600000).toISOString();
        const isAllDay = !item.start?.dateTime && !!item.start?.date;

        let meetUrl = item.hangoutLink;
        if (!meetUrl && item.conferenceData?.entryPoints) {
          const videoEntry = item.conferenceData.entryPoints.find((ep: GoogleEntryPoint) => ep.entryPointType === 'video');
          if (videoEntry?.uri) meetUrl = videoEntry.uri;
        }

        return {
          id: `google_${item.id}`,
          googleEventId: item.id,
          title: item.summary || '(Sem título)',
          description: item.description || '',
          location: item.location || '',
          collaboratorId: targetCollabId,
          categoryId: 'tech_alignment',
          startTime,
          endTime,
          isAllDay,
          meetUrl: meetUrl || undefined,
          attendees: item.attendees?.map((att: GoogleAttendee) => ({
            name: att.displayName || att.email.split('@')[0],
            email: att.email,
            status: att.responseStatus === 'accepted' ? 'accepted' : att.responseStatus === 'declined' ? 'declined' : 'tentative',
          })) || [],
          recurrence: item.recurrence ? 'weekly' : 'none',
          source: 'google_calendar' as const,
          status: item.status === 'cancelled' ? 'cancelled' : 'confirmed',
          createdAt: item.created || new Date().toISOString(),
          updatedAt: item.updated || new Date().toISOString(),
        };
      });

      // Salva eventos no Supabase em lotes para alta performance (reduz de 60s para menos de 1s)
      const recordsToUpsert = mappedEvents.map((ev) => ({
        id: ev.id,
        google_event_id: ev.googleEventId,
        title: ev.title,
        description: ev.description,
        location: ev.location,
        start_time: ev.startTime,
        end_time: ev.endTime,
        is_all_day: ev.isAllDay,
        meet_url: ev.meetUrl || null,
        collaborator_id: targetCollabId,
        category_id: 'tech_alignment',
        source: 'google_calendar',
        status: ev.status,
        updated_at: new Date().toISOString(),
      }));

      for (let i = 0; i < recordsToUpsert.length; i += 50) {
        const chunk = recordsToUpsert.slice(i, i + 50);
        const { error: chunkError } = await supabaseAdmin
          .from('calendar_events')
          .upsert(chunk, { onConflict: 'id' });

        if (chunkError) {
          console.error('Erro ao salvar lote de eventos no Supabase:', chunkError.message);
        }
      }

      const syncRes = NextResponse.json({
        success: true,
        events: mappedEvents,
        syncedCount: mappedEvents.length,
        timestamp: new Date().toISOString(),
      });

      // Reaplica os cookies renovados para as próximas requisições
      if (renewedAccessToken && renewedExpiry) {
        syncRes.cookies.set('google_access_token', renewedAccessToken, {
          path: '/',
          maxAge: 3600,
          sameSite: 'lax',
        });
        syncRes.cookies.set('google_token_expiry', renewedExpiry, {
          path: '/',
          maxAge: 3600,
          sameSite: 'lax',
        });
      }
      if (refreshToken) {
        syncRes.cookies.set('google_refresh_token', refreshToken, {
          path: '/',
          maxAge: 30 * 24 * 3600,
          sameSite: 'lax',
        });
      }

      return syncRes;
    }

    const emptySyncRes = NextResponse.json({
      success: true,
      events: [],
      syncedCount: 0,
      timestamp: new Date().toISOString(),
    });

    if (renewedAccessToken && renewedExpiry) {
      emptySyncRes.cookies.set('google_access_token', renewedAccessToken, {
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
      });
      emptySyncRes.cookies.set('google_token_expiry', renewedExpiry, {
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
      });
    }

    return emptySyncRes;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Erro na rota de sincronização do Google Calendar:', error);
    return NextResponse.json({
      error: 'Erro interno ao processar sincronização',
      message,
    }, { status: 500 });
  }
}
