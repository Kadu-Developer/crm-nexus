import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { accessToken, calendarId = 'primary', timeMin, timeMax } = body;

    // Se um access_token foi fornecido, busca os eventos reais diretamente da API do Google Calendar v3
    if (accessToken) {
      const minTime = timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const maxTime = timeMax || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
      url.searchParams.set('timeMin', minTime);
      url.searchParams.set('timeMax', maxTime);
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('maxResults', '250');

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn('Google Calendar API error response:', errText);
        return NextResponse.json({
          error: 'Falha ao buscar eventos do Google Calendar',
          details: errText,
        }, { status: response.status });
      }

      const data = await response.json();
      const googleItems = data.items || [];

      // Mapear eventos do Google para o modelo CalendarEvent do CRM Nexus
      const mappedEvents = googleItems.map((item: any) => {
        const startTime = item.start?.dateTime || item.start?.date || new Date().toISOString();
        const endTime = item.end?.dateTime || item.end?.date || new Date(new Date(startTime).getTime() + 3600000).toISOString();
        const isAllDay = !item.start?.dateTime && !!item.start?.date;

        // Obter link do Google Meet caso exista
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

      return NextResponse.json({
        success: true,
        events: mappedEvents,
        syncedCount: mappedEvents.length,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      events: [],
      syncedCount: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro na rota de sincronização do Google Calendar:', error);
    return NextResponse.json({
      error: 'Erro interno ao processar sincronização',
      message: error.message,
    }, { status: 500 });
  }
}
