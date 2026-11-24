import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.moyasar.com https://api.moyasar.com https://*.firebaseio.com https://*.googleapis.com https://apis.google.com https://identitytoolkit.googleapis.com;
      style-src 'self' 'unsafe-inline' https://cdn.moyasar.com https://fonts.googleapis.com;
      img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com https://cdn.moyasar.com;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://api.moyasar.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://res.cloudinary.com;
      frame-src 'self' https://api.moyasar.com https://*.firebaseapp.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://api.moyasar.com;
      frame-ancestors 'self';
      ${isProd ? 'upgrade-insecure-requests;' : ''}
    `.replace(/\s{2,}/g, ' ').trim();

    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: cspHeader,
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    if (isProd) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // 301 Permanent redirects for legacy duplicate practice area slugs
      {
        source: '/:locale(ar|en)/services/labor-employment',
        destination: '/:locale/services/labour-employment',
        permanent: true,
      },
      {
        source: '/services/labor-employment',
        destination: '/ar/services/labour-employment',
        permanent: true,
      },
      {
        source: '/:locale(ar|en)/services/estate-family-wealth',
        destination: '/:locale/services/waqf-family-wealth',
        permanent: true,
      },
      {
        source: '/services/estate-family-wealth',
        destination: '/ar/services/waqf-family-wealth',
        permanent: true,
      },
      {
        source: '/:locale(ar|en)/services/corporate-governance',
        destination: '/:locale/services/commercial-corporate',
        permanent: true,
      },
      {
        source: '/services/corporate-governance',
        destination: '/ar/services/commercial-corporate',
        permanent: true,
      },
      {
        source: '/:locale(ar|en)/services/governance',
        destination: '/:locale/services/legal-advisory-governance',
        permanent: true,
      },
      {
        source: '/services/governance',
        destination: '/ar/services/legal-advisory-governance',
        permanent: true,
      },
      {
        source: '/:locale(ar|en)/services/commercial-litigation',
        destination: '/:locale/services/civil-litigation',
        permanent: true,
      },
      {
        source: '/services/commercial-litigation',
        destination: '/ar/services/civil-litigation',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
