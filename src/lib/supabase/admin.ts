import { createClient } from '@supabase/supabase-js';
import { getRequiredEnv } from '@/lib/env';

/**
 * Client Supabase avec service_role pour les opérations côté serveur
 * (sync user Twitch -> public.users). À utiliser uniquement dans des API routes.
 */
export function createAdminClient() {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key);
}
