import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { refreshGoogleAccessToken } from '@/lib/google-tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieToken = request.cookies.get('google_access_token')?.value;
    const cookieExpiry = request.cookies.get('google_token_expiry')?.value;
    const refreshToken = body.refreshToken || request.cookies.get('google_refresh_token')?.value;
    const { calendarId = 'primary', timeMin, timeMax } = body;

    let accessToken = body.accessToken || cookieToken;
    let renewedAccessToken: string | null = null;
    let renewedExpiry: string | null = null;

    // Se o access token estiver ausente ou expirado, tenta renovar com o refresh token
    if (!accessToken || (cookieExpiry && Date.now() > new Date(cookieExpiry).getTime() - 30_000)) {
      if (refreshToken) {
        const renewed = await refreshGoogleAccessToken(refreshToken);
        if (renewed?.access_token) {
          accessToken = renewed.access_token;
          renewedAccessToken = renewed.access_token;
          renewedExpiry = new Date(Date.now() + (renewed.expires_in || 3600) * 1000).toISOString();

          // Atualiza o colaborador com os novos tokens
          await supabaseAdmin.from('calendar_collaborators').update({
            google_access_token: renewed.access_token,
            google_token_expiry: renewedExpiry,
            last_sync_at: new Date().toISOString(),
          }).eq('id', 'collab_carlos');
        }
      }
    }

    // Se um access_token foi fornecido ou está nos cookies, busca os eventos reais diretamente da API do Google Calendar v3
    if (accessToken) {
      const minTime = timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const maxTime = timeMax || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
      url.searchParams.set('timeMin', minTime);
      url.searchParams.set('timeMax', maxTime);
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('maxResults', '250');

      const apiRes = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        console.warn('Google Calendar API error response:', errText);
        return NextResponse.json({
          error: 'Falha ao buscar eventos do Google Calendar',
          details: errText,
        }, { status: apiRes.status });
      }

      const data = await apiRes.json();
      const googleItems = data.items || [];

      // Mapear eventos do Google para o modelo CalendarEvent do CRM Nexus
      const mappedEvents = googleItems.map((item: any) => {
        const startTime = item.start?.dateTime || item.start?.date || new Date().toISOString();
        const endTime = item.end?.dateTime || item.end?.date || new Date(new Date(startTime).getTime() + 3600000).toISOString();
        const isAllDay = !item.start?.dateTime && !!item.start?.date;

        let meetUrl = item.hangoutLink;
        if (!meetUrl && item.conferenceData?.entryPoints) {
          const videoEntry = item.conferenceData.entryPoints.find((ep: any) => ep.entryPointType === 'video');
          if (videoEntry) meetUrl = videoEntry.uri;
        }

        return {
          id: `google_${item.id}`,
          googleEventId: item.id,
          title: item.summary || '(Sem título)',
          description: item.description || '',
          location: item.location || '',
          collaboratorId: 'collab_carlos',
          categoryId: 'tech_alignment',
          startTime,
          endTime,
          isAllDay,
          meetUrl: meetUrl || undefined,
          attendees: item.attendees?.map((att: any) => ({
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

      // Salva eventos no Supabase
      for (const ev of mappedEvents) {
        const { error: eventError } = await supabaseAdmin.from('calendar_events').upsert({
          id: ev.id,
          google_event_id: ev.googleEventId,
          title: ev.title,
          description: ev.description,
          location: ev.location,
          start_time: ev.startTime,
          end_time: ev.endTime,
          is_all_day: ev.isAllDay,
          meet_url: ev.meetUrl || null,
          collaborator_id: 'collab_carlos',
          category_id: 'tech_alignment',
          source: 'google_calendar',
          status: ev.status,
          updated_at: new Date().toISOString(),
        });

        if (eventError) {
          console.error(`Erro ao salvar evento ${ev.id} no Supabase:`, eventError.message);
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
  } catch (error: any) {
    console.error('Erro na rota de sincronização do Google Calendar:', error);
    return NextResponse.json({
      error: 'Erro interno ao processar sincronização',
      message: error.message,
    }, { status: 500 });
  }
}
