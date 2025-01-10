import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      LINEAR_WEBHOOK_SECRET: z.string().min(1),
      LINEAR_CLIENT_ID: z.string().min(1),
      LINEAR_CLIENT_SECRET: z.string().min(1),
    },
    runtimeEnv: {
      LINEAR_WEBHOOK_SECRET: process.env.LINEAR_WEBHOOK_SECRET,
      LINEAR_CLIENT_ID: process.env.LINEAR_CLIENT_ID,
      LINEAR_CLIENT_SECRET: process.env.LINEAR_CLIENT_SECRET,
    },
  });
