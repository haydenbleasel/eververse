import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      STRIPE_SECRET_KEY: z.string().min(1).startsWith('sk_'),
      STRIPE_WEBHOOK_SECRET: z.string().min(1).startsWith('whsec_'),
      STRIPE_PRODUCT_PRO_ID: z.string().min(1),
      STRIPE_PRODUCT_ENTERPRISE_ID: z.string().min(1),
    },
    runtimeEnv: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRODUCT_PRO_ID: process.env.STRIPE_PRODUCT_PRO_ID,
      STRIPE_PRODUCT_ENTERPRISE_ID: process.env.STRIPE_PRODUCT_ENTERPRISE_ID,
    },
  });
