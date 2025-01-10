import { vercel } from '@t3-oss/env-core/presets';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    extends: [vercel()],
    server: {
      ANALYZE: z.string().optional(),

      // Added by Vercel
      NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),

      // URLs
      API_URL: z.string().url().min(1),
      DOCS_URL: z.string().url().min(1),
      EVERVERSE_PORTAL_URL: z.string().url().min(1),
      EVERVERSE_ADMIN_ORGANIZATION_ID: z.string().min(1),

      // Node
      NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
    },
    client: {},
    runtimeEnv: {
      ANALYZE: process.env.ANALYZE,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      EVERVERSE_ADMIN_ORGANIZATION_ID:
        process.env.EVERVERSE_ADMIN_ORGANIZATION_ID,
      API_URL: process.env.API_URL,
      EVERVERSE_PORTAL_URL: process.env.EVERVERSE_PORTAL_URL,
      DOCS_URL: process.env.DOCS_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
  });
