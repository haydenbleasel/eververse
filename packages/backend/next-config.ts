import type { NextConfig } from 'next/types';
import { keys } from './keys';

export const withBackend = (config: NextConfig) => {
  const newConfig = { ...config };

  newConfig.images?.remotePatterns?.push({
    protocol: 'https',
    hostname: new URL(keys().SUPABASE_URL).hostname,
  });

  return config;
};
