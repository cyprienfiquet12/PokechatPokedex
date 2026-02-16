import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/** Autorise uniquement un chemin relatif (évite open redirect). */
function safeRedirectPath(path: string): string {
  const p = path.trim() || '/';
  if (!p.startsWith('/') || p.includes('//')) return '/';
  return p;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next') ?? '/');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Auth callback error', error);
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
