import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const channelId = request.headers.get('X-Goog-Channel-ID');
    const resourceState = request.headers.get('X-Goog-Resource-State');
    const resourceUri = request.headers.get('X-Goog-Resource-URI');

    console.log(`[Google Calendar Webhook] State: ${resourceState}, Channel: ${channelId}, URI: ${resourceUri}`);

    // Quando o Google envia uma notificação de sincronização ('sync' ou 'exists')
    if (resourceState === 'sync' || resourceState === 'exists') {
      // Notificação recebida com sucesso
      return new Response(null, { status: 200 });
    }

    return new Response(null, { status: 200 });
  } catch (err: any) {
    console.error('Erro no webhook do Google Calendar:', err);
    return new Response(null, { status: 500 });
  }
}
