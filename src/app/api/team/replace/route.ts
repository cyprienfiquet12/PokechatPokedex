import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * POST /api/team/replace
 * Body: { userPokemonId: number, newPokemonId: number }
 * Échange le Pokémon en équipe avec l'espèce capturée : le Pokémon remplacé quitte l'équipe
 * (redevient disponible dans les choix) et une nouvelle instance du Pokémon choisi rejoint l'équipe.
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
  const now = new Date().toISOString();

  // Vérifier que le slot appartient bien à l'utilisateur
  const { data: oldSlot, error: fetchError } = await admin
    .from('user_pokemons')
    .select('id')
    .eq('id', userPokemonId)
    .eq('user_id', appUser.id)
    .single();

  if (fetchError || !oldSlot) {
    return NextResponse.json({ error: 'Slot équipe introuvable' }, { status: 404 });
  }

  // 1. Insérer la nouvelle instance du Pokémon choisi dans l'équipe
  const { error: insertError } = await admin.from('user_pokemons').insert({
    user_id: appUser.id,
    pokemon_id: newPokemonId,
    level: 1,
    xp: 0,
    current_hp: baseHp,
    is_shiny: false,
    captured_at: now,
    is_ko: false,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 2. Retirer l'ancien Pokémon du slot (il redevient disponible dans "Choix possibles" via user_pokedex)
  const { error: deleteError } = await admin
    .from('user_pokemons')
    .delete()
    .eq('id', userPokemonId)
    .eq('user_id', appUser.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
