import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ types: data ?? [] });
}
