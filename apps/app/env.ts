import { keys as atlassian } from '@repo/atlassian/keys';
import { keys as email } from '@repo/email/keys';
import { keys as github } from '@repo/github/keys';
import { keys as intercom } from '@repo/intercom/keys';
import { keys as linear } from '@repo/linear/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as slack } from '@repo/slack/keys';
import { keys as widget } from '@repo/widget/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [
    core(),
    observability(),
    atlassian(),
    email(),
    intercom(),
    linear(),
    slack(),
    github(),
    widget(),
    payments(),
  ],
  server: {},
  client: {},
  runtimeEnv: {},
});
