import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

function isUUID(str?: string): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

interface DeleteLeadBody {
  opportunityIds?: string[];
  oppId?: string;
  companyId?: string;
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .select(`
        *,
        company:companies(
          *,
          contacts(*)
        ),
        consultant:profiles(*),
        qualification:qualifications(*),
        activities(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao consultar oportunidades via supabaseAdmin:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Erro na rota GET /api/crm/leads:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let body: DeleteLeadBody = {};
    try {
      body = (await request.json()) as DeleteLeadBody;
    } catch {
      // Body pode ser vazio se chamado via query params
      body = {};
    }

    const searchParams = request.nextUrl.searchParams;
    const oppIdParam = searchParams.get('oppId') || searchParams.get('id');
    const companyIdParam = searchParams.get('companyId');
    const cnpjParam = searchParams.get('cnpj');
    const companyNameParam = searchParams.get('companyName');
    const tradeNameParam = searchParams.get('tradeName');

    const opportunityIds: string[] = [
      ...(Array.isArray(body.opportunityIds) ? body.opportunityIds : []),
      ...(body.oppId ? [body.oppId] : []),
      ...(oppIdParam ? [oppIdParam] : []),
    ].filter(Boolean);

    const companyId: string | undefined = body.companyId || companyIdParam || undefined;
    const cnpj: string | undefined = (body.cnpj || cnpjParam || '').trim() || undefined;
    const companyName: string | undefined = (body.companyName || companyNameParam || '').trim() || undefined;
    const tradeName: string | undefined = (body.tradeName || tradeNameParam || '').trim() || undefined;

    let deletedAny = false;

    // 1. Se companyId UUID for informado, deleta diretamente a empresa (CASCADE no Postgres deleta oportunidades, contatos, qualificações e atividades)
    if (companyId && isUUID(companyId)) {
      const { error: compErr } = await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (!compErr) {
        deletedAny = true;
      } else {
        console.warn('Erro ao deletar empresa por companyId:', compErr);
      }
    }

    // 2. Deletar oportunidades específicas por UUID
    const validOppIds = opportunityIds.filter(isUUID);
    if (validOppIds.length > 0) {
      // Desvincular eventos do calendário primeiro (garantia adicional caso não seja CASCADE)
      await supabaseAdmin
        .from('calendar_events')
        .update({ linked_opportunity_id: null })
        .in('linked_opportunity_id', validOppIds);

      const { error: oppsErr } = await supabaseAdmin
        .from('opportunities')
        .delete()
        .in('id', validOppIds);

      if (!oppsErr) {
        deletedAny = true;
      } else {
        console.warn('Erro ao deletar oportunidades por IDs:', oppsErr);
      }
    }

    // 3. Se temos CNPJ e ainda não deletamos por companyId, deleta por CNPJ
    if (cnpj && !deletedAny) {
      const { data: compByCnpj } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('cnpj', cnpj);

      if (compByCnpj && compByCnpj.length > 0) {
        const cIds = compByCnpj.map((c) => c.id);
        const { error: delErr } = await supabaseAdmin
          .from('companies')
          .delete()
          .in('id', cIds);

        if (!delErr) deletedAny = true;
      }
    }

    // 4. Se temos Nome da Empresa ou Nome Fantasia, deleta por nome
    const namesToSearch = [companyName, tradeName].filter(Boolean) as string[];
    for (const rawName of namesToSearch) {
      const sanitized = rawName.replace(/[,()]/g, ' ').trim();
      if (!sanitized) continue;

      const { data: compByName } = await supabaseAdmin
        .from('companies')
        .select('id')
        .or(`corporate_name.ilike.%${sanitized}%,trade_name.ilike.%${sanitized}%`);

      if (compByName && compByName.length > 0) {
        const cIds = compByName.map((c) => c.id);
        const { error: delErr } = await supabaseAdmin
          .from('companies')
          .delete()
          .in('id', cIds);

        if (!delErr) deletedAny = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead e oportunidades excluídos com sucesso.',
      deletedAny,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Erro na rota DELETE /api/crm/leads:', err);
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir lead', details: message },
      { status: 500 }
    );
  }
}

// Suporte a POST para clientes que não suportam DELETE com body
export async function POST(request: NextRequest) {
  return DELETE(request);
}
