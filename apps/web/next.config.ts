import { env } from '@/env';
import { withBackend } from '@repo/backend/next-config';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogtail, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = withBackend(
  withLogtail({
    ...config,

    transpilePackages: ['@sentry/nextjs'],

    images: {
      ...config.images,
      dangerouslyAllowSVG: true,
    },

    // biome-ignore lint/suspicious/useAwait: <explanation>
    async redirects() {
      return [
        {
          source: '/legal',
          destination: '/legal/privacy',
          permanent: true,
        },
        {
          source: '/acceptable-use',
          destination: '/legal/acceptable-use',
          permanent: true,
        },
        {
          source: '/data-security',
          destination: '/legal/data-security',
          permanent: true,
        },
        {
          source: '/privacy',
          destination: '/legal/privacy',
          permanent: true,
        },
        {
          source: '/terms',
          destination: '/legal/terms',
          permanent: true,
        },
      ];
    },
  })
);

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
