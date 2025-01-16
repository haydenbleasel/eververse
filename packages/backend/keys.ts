import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
      SUPABASE_URL: z.string().url().min(1),
      SUPABASE_ANON_KEY: z.string().min(1),
      POSTGRES_URL_NON_POOLING: z
        .string()
        .url()
        .min(1)
        .startsWith('postgresql://'),
      POSTGRES_PRISMA_URL: z.string().url().min(1).startsWith('postgresql://'),

      // This is a workaround key to get the prisma client to work with pgBouncer
      // https://supabase.com/partners/integrations/vercel
      PGBOUNCER_POSTGRES_PRISMA_URL: z
        .string()
        .url()
        .min(1)
        .startsWith('postgresql://'),
    },
    client: {
      NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    },
    runtimeEnv: {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
      PGBOUNCER_POSTGRES_PRISMA_URL: process.env.PGBOUNCER_POSTGRES_PRISMA_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  });
