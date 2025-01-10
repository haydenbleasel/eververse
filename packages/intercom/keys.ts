import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      INTERCOM_APP_ID: z.string().min(1),
      INTERCOM_WEBHOOK_SECRET: z.string().min(1),
      INTERCOM_CLIENT_ID: z.string().min(1),
      INTERCOM_CLIENT_SECRET: z.string().min(1),
      INTERCOM_ACCESS_TOKEN: z.string().min(1),
    },
    runtimeEnv: {
      INTERCOM_APP_ID: process.env.INTERCOM_APP_ID,
      INTERCOM_WEBHOOK_SECRET: process.env.INTERCOM_WEBHOOK_SECRET,
      INTERCOM_CLIENT_ID: process.env.INTERCOM_CLIENT_ID,
      INTERCOM_CLIENT_SECRET: process.env.INTERCOM_CLIENT_SECRET,
      INTERCOM_ACCESS_TOKEN: process.env.INTERCOM_ACCESS_TOKEN,
    },
  });
