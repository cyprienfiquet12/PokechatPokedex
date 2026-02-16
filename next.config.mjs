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
    ];
  },
};

export default nextConfig;
