import type { NextConfig } from 'next/types';
import { keys } from './keys';

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

export const withBackend = (config: NextConfig) => {
  const newConfig = { ...config };

  newConfig.images?.remotePatterns?.push({
    protocol,
    hostname: new URL(keys().SUPABASE_URL).hostname,
  });

  return config;
};
