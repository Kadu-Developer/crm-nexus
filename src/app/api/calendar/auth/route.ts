import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectPath = searchParams.get('redirect') || '/?view=calendar';
  const collaboratorId = searchParams.get('collaboratorId') || '';

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  // Detecta dinamicamente a URL base atual (ex: http://localhost:3000 ou https://crm-nexus.vercel.app)
  const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${origin}/api/calendar/callback`;

  if (!clientId) {
    return NextResponse.json({
      error: 'GOOGLE_CLIENT_ID não configurado',
      authUrl: null,
    }, { status: 400 });
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
  ].join(' ');

  const state = JSON.stringify({ redirectPath, collaboratorId, timestamp: Date.now() });

  const authUrl = `${GOOGLE_AUTH_ENDPOINT}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  return NextResponse.json({ authUrl, redirectUri });
}
