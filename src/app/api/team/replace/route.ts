import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * POST /api/team/replace
 * Body: { userPokemonId: number, newPokemonId: number }
 * Remplace le Pokémon en équipe par l'espèce capturée : met à jour pokemon_id, level=1, xp=0, current_hp=base_hp du nouveau, is_ko=false.
 */
export async function POST(request: Request) {
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

  const body = await request.json();
  const userPokemonId = body.userPokemonId;
  const newPokemonId = body.newPokemonId;

  if (typeof userPokemonId !== 'number' || typeof newPokemonId !== 'number') {
    return NextResponse.json(
      { error: 'userPokemonId et newPokemonId requis (numbers)' },
      { status: 400 }
    );
  }

  const { data: newPokemon } = await admin
    .from('pokemons')
    .select('base_hp')
    .eq('id', newPokemonId)
    .single();

  if (!newPokemon) {
    return NextResponse.json({ error: 'Espèce Pokémon introuvable' }, { status: 404 });
  }

  const baseHp = newPokemon.base_hp ?? 50;

  const { error } = await admin
    .from('user_pokemons')
    .update({
      pokemon_id: newPokemonId,
      level: 1,
      xp: 0,
      current_hp: baseHp,
      is_ko: false,
    })
    .eq('id', userPokemonId)
    .eq('user_id', appUser.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
