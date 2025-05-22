import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import { createSecureHeaders } from 'next-secure-headers';

// @ts-expect-error "no types"
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const otelRegex = /@opentelemetry\/instrumentation/;

export const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },

      // Seed data
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // biome-ignore lint/suspicious/useAwait: "headers" is an async function
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: createSecureHeaders({
          // HSTS Preload: https://hstspreload.org/
          forceHTTPSRedirect: [
            true,
            { maxAge: 63_072_000, includeSubDomains: true, preload: true },
          ],
        }),
      },
    ];
  },

  // biome-ignore lint/suspicious/useAwait: "rewrites" is an async function
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },

  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    config.ignoreWarnings = [{ module: otelRegex }];

    return config;
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // This is required to support Sentry
  transpilePackages: ['@sentry/nextjs'],
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
