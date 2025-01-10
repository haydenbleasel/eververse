import { env } from '@/env';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogtail, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = withLogtail({
  ...config,

  // biome-ignore lint/suspicious/useAwait: <explanation>
  async redirects() {
    return [
      {
        source: '/features/groups',
        destination: '/features',
        permanent: true,
      },
      {
        source: '/features/products',
        destination: '/features',
        permanent: true,
      },
      {
        source: '/data',
        destination: '/data/users',
        permanent: false,
      },
      {
        source: '/api/webhooks/:path*',
        destination: 'https://api.eververse.ai/webhooks/:path*',
        permanent: true,
      },
      {
        source: '/select-organization',
        destination: '/setup',
        permanent: true,
      },
    ];
  },
});

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
