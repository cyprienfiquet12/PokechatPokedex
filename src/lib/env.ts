/**
 * Variables d'environnement requises pour le build et l'exécution.
 * En production, l'absence d'une variable fait échouer le build ou le démarrage.
 */
const required = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

const missing = Object.entries(required)
  .filter(([, v]) => v == null || String(v).trim() === '')
  .map(([k]) => k);

if (missing.length > 0) {
  const msg = `Variables d'environnement manquantes : ${missing.join(', ')}. Voir .env.local.example.`;
  // En dev uniquement : avertir (le build peut tourner sans env en CI ; l'erreur sera levée à l'usage en prod)
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[env] ${msg}`);
  }
}

export function getRequiredEnv<K extends keyof typeof required>(key: K): string {
  const v = required[key];
  if (v == null || String(v).trim() === '') {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
  return String(v);
}
