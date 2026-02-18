/**
 * Désactive le cache pour les réponses API (données BDD dynamiques).
 * À utiliser sur les routes qui renvoient des données susceptibles de changer.
 * Inclut des directives pour Vercel / CDN (private, s-maxage=0) afin d'éviter
 * le cache edge et d'afficher des données à jour (ex. classement après captures).
 */
export const NO_CACHE_HEADERS = {
  'Cache-Control':
    'no-store, no-cache, max-age=0, must-revalidate, private, s-maxage=0, stale-while-revalidate=0',
  Pragma: 'no-cache',
  Expires: '0',
} as const;
