import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { NO_CACHE_HEADERS } from '@/lib/apiCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/team -> liste de tous les Pokémon du joueur (table user_pokemons = l'équipe).
 * Aucune modification de structure BDD : l'équipe = tous les user_pokemons pour cet user.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  const providerId = user.user_metadata?.provider_id ?? user.user_metadata?.sub;
  if (!providerId) {
    return NextResponse.json({ error: 'Profil Twitch introuvable' }, { status: 400, headers: NO_CACHE_HEADERS });
  }

  const admin = createAdminClient();
  const { data: appUser } = await admin
    .from('users')
    .select('id')
    .eq('twitch_id', String(providerId))
    .single();
  if (!appUser) {
    return NextResponse.json({ error: 'Utilisateur non synchronisé' }, { status: 404, headers: NO_CACHE_HEADERS });
  }

  const { data: team, error } = await admin
    .from('user_pokemons')
    .select(
      `
      id, user_id, pokemon_id, level, xp, current_hp, is_shiny, captured_at, is_ko,
      pokemons ( id, pokedex_id, name, type_1, type_2, sprite_url, image_url, base_hp, rarity )
    `
    )
    .eq('user_id', appUser.id)
    .order('captured_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }

  return NextResponse.json({ team: team ?? [] }, { headers: NO_CACHE_HEADERS });
}
