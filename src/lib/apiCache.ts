/**
 * Désactive le cache pour les réponses API (données BDD dynamiques).
 * À utiliser sur les routes qui renvoient des données susceptibles de changer.
 */
export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
  Pragma: 'no-cache',
} as const;
