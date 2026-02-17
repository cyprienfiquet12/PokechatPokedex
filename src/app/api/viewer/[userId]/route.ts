import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { NO_CACHE_HEADERS } from '@/lib/apiCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/viewer/[userId]
 * Vue publique d'un viewer : infos user, équipe, badges, inventaire.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const uid = parseInt(userId, 10);
  if (Number.isNaN(uid)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400, headers: NO_CACHE_HEADERS });
  }

  const admin = createAdminClient();

  const { data: user, error: userError } = await admin
    .from('users')
    .select('id, username, poke_coins')
    .eq('id', uid)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: 'Viewer introuvable' }, { status: 404, headers: NO_CACHE_HEADERS });
  }

  const [teamRes, badgesRes, inventoryRes] = await Promise.all([
    admin
      .from('user_pokemons')
      .select(
        `
        id, pokemon_id, level, current_hp, is_shiny,
        pokemons ( id, pokedex_id, name, type_1, type_2, sprite_url, image_url )
      `
      )
      .eq('user_id', uid)
      .order('captured_at', { ascending: false }),
    admin
      .from('user_badges')
      .select('id, badge_id, earned_at, badges ( id, name, description, image_url, sprite_url )')
      .eq('user_id', uid)
      .order('earned_at', { ascending: false }),
    admin
      .from('user_inventory')
      .select('id, item_id, quantity, shop_items ( id, name, description, sprite_url )')
      .eq('user_id', uid)
      .gt('quantity', 0),
  ]);

  return NextResponse.json(
    {
      user: {
        id: user.id,
        username: user.username,
        poke_coins: user.poke_coins,
      },
      team: teamRes.data ?? [],
      badges: badgesRes.data ?? [],
      inventory: inventoryRes.data ?? [],
    },
    { headers: NO_CACHE_HEADERS }
  );
}
