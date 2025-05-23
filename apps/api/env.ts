import { keys as linear } from '@repo/linear/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [core(), observability(), payments(), linear()],
  server: {},
  client: {},
  runtimeEnv: {},
});
