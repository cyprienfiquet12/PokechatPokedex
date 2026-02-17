import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { NO_CACHE_HEADERS } from '@/lib/apiCache';

export const dynamic = 'force-dynamic';

/**
 * Après login Twitch, synchronise auth.users avec public.users.
 * Twitch provider met dans user_metadata: provider_id (twitch id), full_name, etc.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  const providerId = user.user_metadata?.provider_id ?? user.user_metadata?.sub;
  const username =
    user.user_metadata?.preferred_username ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    `user_${providerId}`;
  const display_name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    username;

  if (!providerId) {
    return NextResponse.json(
      { error: 'Provider Twitch non reconnu' },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('users')
    .select('id, username, xp, level, poke_coins')
    .eq('twitch_id', String(providerId))
    .single();

  if (existing) {
    await admin
      .from('users')
      .update({ username, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    return NextResponse.json(
      {
        appUser: {
          id: existing.id,
          username,
          display_name,
          xp: existing.xp,
          level: existing.level,
          poke_coins: existing.poke_coins,
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  }

  const { data: inserted, error: insertError } = await admin
    .from('users')
    .insert({
      twitch_id: String(providerId),
      username: String(username).slice(0, 255),
    })
    .select('id, username, xp, level, poke_coins')
    .single();

  if (insertError) {
    console.error('sync-user insert error', insertError);
    return NextResponse.json(
      { error: 'Erreur lors de la création du profil' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      appUser: {
        id: inserted.id,
        username: inserted.username,
        display_name,
        xp: inserted.xp,
        level: inserted.level,
        poke_coins: inserted.poke_coins,
      },
    },
    { headers: NO_CACHE_HEADERS }
  );
}
