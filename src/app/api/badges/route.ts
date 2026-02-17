import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { NO_CACHE_HEADERS } from '@/lib/apiCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/badges -> badges de l'utilisateur connecté.
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

  const { data: rows, error } = await admin
    .from('user_badges')
    .select(
      'id, badge_id, earned_at, badges ( id, name, description, image_url, sprite_url )'
    )
    .eq('user_id', appUser.id)
    .order('earned_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }

  return NextResponse.json({ badges: rows ?? [] }, { headers: NO_CACHE_HEADERS });
}
