import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { NO_CACHE_HEADERS } from '@/lib/apiCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard
 * Classement des viewers par nombre de Pokémon capturés (espèces distinctes dans user_pokedex).
 */
export async function GET() {
  const admin = createAdminClient();

  const { data: rows, error: countError } = await admin
    .from('user_pokedex')
    .select('user_id');

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }

  const countByUser: Record<number, number> = {};
  (rows ?? []).forEach((row: { user_id: number }) => {
    countByUser[row.user_id] = (countByUser[row.user_id] ?? 0) + 1;
  });

  const userIds = Object.keys(countByUser).map(Number).filter((id) => countByUser[id] > 0);
  if (userIds.length === 0) {
    return NextResponse.json({ leaderboard: [] }, { headers: NO_CACHE_HEADERS });
  }

  const { data: users, error: usersError } = await admin
    .from('users')
    .select('id, username, level, xp, poke_coins')
    .in('id', userIds);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }

  const leaderboard = (users ?? [])
    .map((u) => ({
      user_id: u.id,
      username: u.username,
      level: u.level,
      xp: u.xp,
      poke_coins: u.poke_coins,
      captured_count: countByUser[u.id] ?? 0,
    }))
    .sort((a, b) => b.captured_count - a.captured_count)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return NextResponse.json({ leaderboard }, { headers: NO_CACHE_HEADERS });
}
