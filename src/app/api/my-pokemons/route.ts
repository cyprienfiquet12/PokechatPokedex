import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * GET /api/my-pokemons
 * Liste tous les Pokémon du joueur (user_pokemons = équipe).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const providerId = user.user_metadata?.provider_id ?? user.user_metadata?.sub;
  if (!providerId) {
    return NextResponse.json({ error: 'Profil Twitch introuvable' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: appUser } = await admin
    .from('users')
    .select('id')
    .eq('twitch_id', String(providerId))
    .single();
  if (!appUser) {
    return NextResponse.json({ error: 'Utilisateur non synchronisé' }, { status: 404 });
  }

  const { data: list, error } = await admin
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pokemons: list ?? [] });
}
