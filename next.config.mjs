/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // En production, éviter de divulguer la version Next
  poweredByHeader: false,
  // Headers de sécurité (complémentaires à ceux du hébergeur)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Désactiver le cache edge pour le classement et son API (données live)
      {
        source: '/classement/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/api/leaderboard',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, max-age=0, must-revalidate, private' },
        ],
      },
    ];
  },
};

export default nextConfig;
