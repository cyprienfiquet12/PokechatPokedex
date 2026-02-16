import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRequiredEnv } from '@/lib/env';

export async function createClient() {
  const cookieStore = await cookies();
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createServerClient(url, key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  );
}
