import { env } from '@/env';
import { Prose } from '@repo/design-system/components/prose';
import { StackCard } from '@repo/design-system/components/stack-card';
import { LinearInstallationForm } from './install-form';

const webhookUrl = new URL('/webhooks/linear', env.EVERVERSE_API_URL);

export const InstallLinear = () => (
  <>
    <div className="grid gap-2">
      <h1 className="m-0 font-semibold text-4xl tracking-tight">
        Install Linear
      </h1>
      <p className="mt-2 mb-0 text-muted-foreground">
        Follow the steps below to integrate Linear with Eververse. This assumes
        you already have an Linear account. If you don&apos;t, head to the{' '}
        <a
          href="https://linear.app/signup"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          Linear signup page
        </a>
        .
      </p>
    </div>
    <StackCard title="1. Create a webhook">
      <Prose className="max-w-none">
        <p>
          To get started, you need to create a new webhook. Go to the{' '}
          <a
            href="https://linear.app/settings/api"
            target="_blank"
            rel="noreferrer"
          >
            API page
          </a>{' '}
          and click "New webhook". Give it a name, like "Eververse" and set the
          endpoint URL to:
        </p>

        <div className="rounded-md bg-secondary px-4 py-3">
          <p>{webhookUrl.toString()}</p>
        </div>

        <p>
          Then check the <code>Issue</code> data change events and set your
          team.
        </p>
      </Prose>
    </StackCard>
    <StackCard title="2. Create an access token">
      <Prose className="max-w-none">
        <p>
          Go to the{' '}
          <a
            href="https://linear.app/eververse/settings/account/security"
            target="_blank"
            rel="noreferrer"
          >
            API page
          </a>{' '}
          and click "New API key". Give it a name, like "Eververse" and set the
          permissions to:
        </p>

        <ul>
          {['Read', 'Write', 'Create issues', 'Create comments'].map(
            (permission) => (
              <li key={permission}>{permission}</li>
            )
          )}
        </ul>

        <p>then set the team access.</p>

        <p>
          Hit "Create", then copy and paste the API key into the field below.
        </p>

        <LinearInstallationForm />
      </Prose>
    </StackCard>
  </>
);
