import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken,
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

    if (accessToken) {
      const googleEventPayload: any = {
        summary: title,
        description: description || '',
        start: { dateTime: startTime, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endTime, timeZone: 'America/Sao_Paulo' },
        attendees: attendees.map((a: any) => ({ email: a.email, displayName: a.name })),
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
        const video = createdEvent.conferenceData.entryPoints.find((e: any) => e.entryPointType === 'video');
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
  } catch (err: any) {
    console.error('Erro na criação de evento:', err);
    return NextResponse.json({ error: 'Erro interno ao criar evento', message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const calendarId = searchParams.get('calendarId') || 'primary';
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!eventId) {
      return NextResponse.json({ error: 'ID do evento não informado' }, { status: 400 });
    }

    if (accessToken && !eventId.startsWith('evt_')) {
      const googleId = eventId.replace('google_', '');
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleId)}`;

      await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao excluir evento', message: err.message }, { status: 500 });
  }
}
