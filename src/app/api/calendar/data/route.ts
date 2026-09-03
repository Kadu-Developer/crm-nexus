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

      const { error } = await supabaseAdmin
        .from('calendar_events')
        .delete()
        .neq('id', '____dummy_never_matches____');

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      if (disconnect) {
        // Limpa tokens salvos no banco para desconectar a conta
        await supabaseAdmin.from('calendar_collaborators').update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expiry: null,
          google_connected: false,
          sync_status: 'disconnected',
        }).neq('id', '____');
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
      const { error } = await supabaseAdmin
        .from('calendar_collaborators')
        .upsert(data, { onConflict: 'id' });

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

    return NextResponse.json({ success: false, error: 'Target inválido' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
