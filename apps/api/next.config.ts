import { env } from '@/env';
import { withBackend } from '@repo/backend/next-config';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogtail, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = withBackend(
  withLogtail({
    ...config,

    // biome-ignore lint/suspicious/useAwait: "redirects is async"
    async redirects() {
      return [
        {
          source: '/',
          destination: 'https://www.eververse.ai/',
          permanent: true,
        },
      ];
    },

    // biome-ignore lint/suspicious/useAwait: "headers is async"
    async headers() {
      return [
        ...config.headers(),
        {
          source: '/widget.js|/panel|/trigger',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization',
            },
          ],
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
