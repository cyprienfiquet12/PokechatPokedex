import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { NO_CACHE_HEADERS } from '@/lib/apiCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/types -> liste des types avec sprite_url (table types).
 */
export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('types')
    .select('id, name, sprite_url')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
  return NextResponse.json({ types: data ?? [] }, { headers: NO_CACHE_HEADERS });
}
