import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      SLACK_CLIENT_ID: z.string().min(1),
      SLACK_CLIENT_SECRET: z.string().min(1),
    },
    runtimeEnv: {
      SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
      SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    },
  });
