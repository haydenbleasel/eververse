import { env } from '@/env';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogtail, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = withLogtail({
  ...config,

  images: {
    ...config.images,
    dangerouslyAllowSVG: true,
  },

  // biome-ignore lint/suspicious/useAwait: <explanation>
  async redirects() {
    return [
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
});

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
