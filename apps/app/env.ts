import { keys as email } from '@repo/email/keys';
import { keys as github } from '@repo/github/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [core(), observability(), email(), github(), payments()],
  server: {},
  client: {
    NEXT_PUBLIC_LOGO_DEV_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_LOGO_DEV_API_KEY: process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY,
  },
});
