import { env } from '@/env';
import { Prose } from '@repo/design-system/components/prose';
import { StackCard } from '@repo/design-system/components/stack-card';
import { IntercomInstallationForm } from './install-form';

const webhookUrl = new URL('/webhooks/intercom', env.EVERVERSE_API_URL);

export const InstallIntercom = () => (
  <>
    <div className="grid gap-2">
      <h1 className="m-0 font-semibold text-4xl tracking-tight">
        Install Intercom
      </h1>
      <p className="mt-2 mb-0 text-muted-foreground">
        Follow the steps below to integrate Intercom with Eververse. This
        assumes you already have an Intercom account. If you don&apos;t, head to
        the{' '}
        <a
          href="https://www.intercom.com/signup"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          Intercom signup page
        </a>
        .
      </p>
    </div>
    <StackCard title="1. Create a new Intercom app">
      <Prose className="max-w-none">
        <p>
          To get started, you need to create a new Intercom app. Go to the{' '}
          <a
            href="https://app.intercom.com/a/apps/_/developer-hub"
            target="_blank"
            rel="noreferrer"
          >
            Developer Hub
          </a>{' '}
          and click "New app". Give it a name, like "Eververse".
        </p>
      </Prose>
    </StackCard>
    <StackCard title="2. Set up webhooks">
      <Prose className="max-w-none">
        <p>
          Click on the "Webhooks" tab in the sidebar. Set the endpoint URL to:
        </p>

        <div className="rounded-md bg-secondary px-4 py-3">
          <p>{webhookUrl.toString()}</p>
        </div>

        <p>
          Open the Topics dropdown and select{' '}
          <code>conversation_part.tag.created</code>.
        </p>
      </Prose>
    </StackCard>
    <StackCard title="3. Provide your App ID">
      <Prose className="max-w-none">
        <p>Find your Intercom app ID from the URL. It should look like this:</p>

        <div className="rounded-md bg-secondary px-4 py-3">
          <p>
            https://app.intercom.com/a/apps/
            <span className="font-semibold text-primary">{'your-app-id'}</span>
          </p>
        </div>

        <p>Copy and paste your App ID into the field below.</p>

        <IntercomInstallationForm />
      </Prose>
    </StackCard>
  </>
);
