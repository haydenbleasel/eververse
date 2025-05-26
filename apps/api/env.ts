import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [core(), observability(), payments()],
  server: {
    SUPABASE_AUTH_HOOK_SECRET: z.string(),
  },
  client: {},
  runtimeEnv: {
    SUPABASE_AUTH_HOOK_SECRET: process.env.SUPABASE_AUTH_HOOK_SECRET,
  },
});
