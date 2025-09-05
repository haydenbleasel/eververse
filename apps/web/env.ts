import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v3';

export const env = createEnv({
  extends: [core(), observability(), payments()],
  server: {
    EVERVERSE_ADMIN_WIDGET_ID: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    EVERVERSE_ADMIN_WIDGET_ID: process.env.EVERVERSE_ADMIN_WIDGET_ID,
  },
});
