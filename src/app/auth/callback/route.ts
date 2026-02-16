import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/** Autorise uniquement un chemin relatif (évite open redirect). */
function safeRedirectPath(path: string): string {
  const p = path.trim() || '/';
  if (!p.startsWith('/') || p.includes('//')) return '/';
  return p;
}

/** Base URL du site pour les redirections (évite localhost en production derrière proxy). */
function getRedirectBase(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    const base = envUrl.replace(/\/$/, '');
    if (base.startsWith('http')) return base;
  }
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto === 'https' ? 'https' : 'http'}://${forwardedHost}`;
  }
  const { origin } = new URL(request.url);
  return origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next') ?? '/');
  const base = getRedirectBase(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
    console.error('Auth callback error', error);
  }

  return NextResponse.redirect(`${base}/?error=auth`);
}
