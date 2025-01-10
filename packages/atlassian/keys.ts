import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      ATLASSIAN_CLIENT_ID: z.string().min(1),
      ATLASSIAN_CLIENT_SECRET: z.string().min(1),
    },
    runtimeEnv: {
      ATLASSIAN_CLIENT_ID: process.env.ATLASSIAN_CLIENT_ID,
      ATLASSIAN_CLIENT_SECRET: process.env.ATLASSIAN_CLIENT_SECRET,
    },
  });
