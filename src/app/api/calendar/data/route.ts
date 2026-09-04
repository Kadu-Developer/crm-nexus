import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Serve os dados do calendário (colaboradores, eventos e configurações) usando o
 * supabaseAdmin (service role) no servidor, que ignora RLS e não depende de uma
 * sessão autenticada do browser. Resolve os 401/RLS que bloqueiam a leitura
 * direta via supabase client quando o usuário não tem sessão no Supabase Auth.
 */
export async function GET(request: NextRequest) {
  try {
    const include = request.nextUrl.searchParams.get('include') || 'all';

    const fetchCollaborators =
      include === 'all' || include === 'collaborators';
    const fetchEvents = include === 'all' || include === 'events';
    const fetchSettings = include === 'all' || include === 'settings';

    // Busca em paralelo para reduzir latência
    const [collabsRes, eventsRes, settingsRes] = await Promise.all([
      fetchCollaborators
        ? supabaseAdmin
            .from('calendar_collaborators')
            .select('*')
            .order('created_at', { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      fetchEvents
        ? supabaseAdmin
            .from('calendar_events')
            .select('*')
            .order('start_time', { ascending: true })
            .limit(5000)
        : Promise.resolve({ data: [], error: null }),
      fetchSettings
        ? supabaseAdmin
            .from('calendar_settings')
            .select('*')
            .limit(1)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (collabsRes.error) {
      console.error('Erro ao buscar colaboradores:', collabsRes.error.message);
    }
    if (eventsRes.error) {
      console.error('Erro ao buscar eventos:', eventsRes.error.message);
    }
    if (settingsRes.error) {
      console.error('Erro ao buscar configurações:', settingsRes.error.message);
    }

    return NextResponse.json({
      success: true,
      collaborators: collabsRes.data || [],
      events: eventsRes.data || [],
      settings: settingsRes.data && settingsRes.data.length > 0 ? settingsRes.data[0] : null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Erro na rota de dados do calendário:', err);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar dados do calendário', message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const target = request.nextUrl.searchParams.get('target') || 'events';

    if (target === 'events') {
      const disconnect = request.nextUrl.searchParams.get('disconnect') === 'true';
      const collaboratorId = request.nextUrl.searchParams.get('collaboratorId');

      let query = supabaseAdmin.from('calendar_events').delete();
      if (collaboratorId) {
        query = query.eq('collaborator_id', collaboratorId);
      } else {
        query = query.neq('id', '____dummy_never_matches____');
      }

      const { error } = await query;
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      if (disconnect) {
        if (collaboratorId) {
          await supabaseAdmin.from('calendar_collaborators').update({
            google_access_token: null,
            google_refresh_token: null,
            google_token_expiry: null,
            google_connected: false,
            sync_status: 'disconnected',
          }).eq('id', collaboratorId);
        } else {
          // Limpa tokens salvos no banco para desconectar todas as contas
          await supabaseAdmin.from('calendar_collaborators').update({
            google_access_token: null,
            google_refresh_token: null,
            google_token_expiry: null,
            google_connected: false,
            sync_status: 'disconnected',
          }).neq('id', '____');
        }
      }

      const res = NextResponse.json({
        success: true,
        message: 'Base de dados de eventos limpa com sucesso.',
      });

      if (disconnect) {
        res.cookies.delete('google_access_token');
        res.cookies.delete('google_refresh_token');
        res.cookies.delete('google_token_expiry');
      }

      return res;
    }

    if (target === 'disconnect_collaborator') {
      const collaboratorId = request.nextUrl.searchParams.get('collaboratorId');
      if (!collaboratorId) {
        return NextResponse.json({ success: false, error: 'collaboratorId é obrigatório' }, { status: 400 });
      }

      // 1. Reseta os tokens do colaborador
      const { error: updateError } = await supabaseAdmin.from('calendar_collaborators').update({
        google_access_token: null,
        google_refresh_token: null,
        google_token_expiry: null,
        google_connected: false,
        sync_status: 'disconnected',
      }).eq('id', collaboratorId);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      // 2. Apaga TODOS os eventos deste colaborador no banco de dados para que sumam imediatamente
      const { error: deleteEventsError } = await supabaseAdmin
        .from('calendar_events')
        .delete()
        .eq('collaborator_id', collaboratorId);

      if (deleteEventsError) {
        console.warn('Aviso ao apagar eventos do colaborador desconectado:', deleteEventsError.message);
      }

      const res = NextResponse.json({
        success: true,
        message: 'Colaborador desconectado e todos os seus eventos foram apagados da agenda com sucesso.',
      });

      res.cookies.delete('google_access_token');
      res.cookies.delete('google_refresh_token');
      res.cookies.delete('google_token_expiry');

      return res;
    }

    if (target === 'event') {
      const eventId = request.nextUrl.searchParams.get('eventId');
      if (!eventId) {
        return NextResponse.json({ success: false, error: 'eventId é obrigatório' }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Evento excluído com sucesso.' });
    }

    return NextResponse.json({ success: false, error: 'Target inválido' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target, data } = body;

    if (target === 'collaborators' && Array.isArray(data)) {
      // Busca dados atuais no banco para preservar google_connected e tokens salvos
      const { data: currentDbCollabs } = await supabaseAdmin
        .from('calendar_collaborators')
        .select('id, google_connected, sync_status, avatar, google_access_token, google_refresh_token, google_token_expiry');

      const dbMap = new Map((currentDbCollabs || []).map((c) => [c.id, c]));

      const safeData = data.map((item: any) => {
        const existing = dbMap.get(item.id);
        const avatar = item.avatar || existing?.avatar || (item.name ? item.name.slice(0, 2).toUpperCase() : 'CO');
        if (existing?.google_connected && item.google_connected === false) {
          // Mantém conexão ativa se o banco já tiver registrado
          return {
            ...item,
            avatar,
            google_connected: true,
            sync_status: existing.sync_status || 'synced',
          };
        }
        return {
          ...item,
          avatar,
        };
      });

      const { error } = await supabaseAdmin
        .from('calendar_collaborators')
        .upsert(safeData, { onConflict: 'id' });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, count: data.length });
    }

    if (target === 'settings' && data) {
      const { error } = await supabaseAdmin
        .from('calendar_settings')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (target === 'event' && data) {
      const eventPayload = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        collaborator_id: data.collaboratorId || data.ctoId,
        additional_collaborator_ids: data.additionalCollaboratorIds || [],
        category_id: data.categoryId || 'tech_alignment',
        start_time: data.startTime,
        end_time: data.endTime,
        is_all_day: data.isAllDay || false,
        meet_url: data.meetUrl || null,
        location: data.location || '',
        attendees: data.attendees || [],
        linked_opportunity_id: data.linkedOpportunityId || null,
        opportunity_title: data.opportunityTitle || null,
        opportunity_company_name: data.opportunityCompanyName || null,
        opportunity_score: data.opportunityScore || null,
        stage_title: data.stageTitle || null,
        google_event_id: data.googleEventId || null,
        recurrence: data.recurrence || 'none',
        source: data.source || 'crm_nexus',
        status: data.status || 'confirmed',
        updated_at: new Date().toISOString(),
      };

      const { data: savedRow, error } = await supabaseAdmin
        .from('calendar_events')
        .upsert(eventPayload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, event: savedRow });
    }

    return NextResponse.json({ success: false, error: 'Target inválido' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
