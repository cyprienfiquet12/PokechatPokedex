import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { NO_CACHE_HEADERS } from '@/lib/apiCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pokedex/stats
 * Retourne le nombre total de Pokémon et le nombre capturés par l'utilisateur connecté.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  const { count: total, error: totalError } = await admin
    .from('pokemons')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    return NextResponse.json({ error: totalError.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }

  let captured = 0;
  if (user) {
    const providerId = user.user_metadata?.provider_id ?? user.user_metadata?.sub;
    const { data: appUser } = await admin
      .from('users')
      .select('id')
      .eq('twitch_id', String(providerId))
      .single();
    if (appUser) {
      const { count: capturedCount, error: capturedError } = await admin
        .from('user_pokedex')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', appUser.id);
      if (!capturedError) captured = capturedCount ?? 0;
    }
  }

  return NextResponse.json(
    { total: total ?? 0, captured },
    { headers: NO_CACHE_HEADERS }
  );
}
