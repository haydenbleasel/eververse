import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      GITHUB_APP_ID: z.string().min(1),
      GITHUB_PRIVATE_KEY: z.string().min(1),
      GITHUB_APP_SLUG: z.string().min(1),
    },
    runtimeEnv: {
      GITHUB_APP_ID: process.env.GITHUB_APP_ID,
      GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY,
      GITHUB_APP_SLUG: process.env.GITHUB_APP_SLUG,
    },
  });
