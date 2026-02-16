import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * GET /api/pokedex
 * Liste tous les Pokémon avec indicateur "capturé" pour l'utilisateur connecté.
 * Query: ?limit=50&offset=0
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);
  const offset = Number(searchParams.get('offset')) || 0;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  let appUserId: number | null = null;
  if (user) {
    const providerId = user.user_metadata?.provider_id ?? user.user_metadata?.sub;
    const { data: appUser } = await admin
      .from('users')
      .select('id')
      .eq('twitch_id', String(providerId))
      .single();
    appUserId = appUser?.id ?? null;
  }

  const { data: pokemons, error: pokemonError } = await admin
    .from('pokemons')
    .select('id, pokedex_id, name, type_1, type_2, sprite_url, image_url, rarity')
    .order('pokedex_id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (pokemonError) {
    return NextResponse.json({ error: pokemonError.message }, { status: 500 });
  }

  const capturedMap: Record<number, string | null> = {};
  if (appUserId && pokemons?.length) {
    const ids = pokemons.map((p) => p.id);
    const { data: entries } = await admin
      .from('user_pokedex')
      .select('pokemon_id, first_captured_at')
      .eq('user_id', appUserId)
      .in('pokemon_id', ids);
    entries?.forEach((e) => {
      capturedMap[e.pokemon_id] = e.first_captured_at ?? null;
    });
  }

  const list = (pokemons ?? []).map((p) => ({
    ...p,
    captured: !!capturedMap[p.id],
    first_captured_at: capturedMap[p.id] ?? null,
  }));

  return NextResponse.json({ pokemons: list, total: list.length });
}
