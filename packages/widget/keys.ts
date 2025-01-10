import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      EVERVERSE_WIDGET_URL: z.string().url().min(1),
    },
    runtimeEnv: {
      EVERVERSE_WIDGET_URL: process.env.EVERVERSE_WIDGET_URL,
    },
  });
