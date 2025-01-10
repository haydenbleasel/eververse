import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      WIDGET_URL: z.string().url().min(1),
    },
    runtimeEnv: {
      WIDGET_URL: process.env.WIDGET_URL,
    },
  });
