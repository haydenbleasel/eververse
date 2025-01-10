import { keys as intercom } from '@repo/intercom/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as widget } from '@repo/widget/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [core(), observability(), intercom(), widget(), payments()],
  client: {},
  runtimeEnv: {},
});
