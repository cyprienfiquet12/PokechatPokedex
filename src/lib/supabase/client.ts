import { createBrowserClient } from '@supabase/ssr';
import { getRequiredEnv } from '@/lib/env';

export function createClient() {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createBrowserClient(url, key);
}
