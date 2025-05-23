import { env } from '@/env';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { Prose } from '@repo/design-system/components/prose';
import { StackCard } from '@repo/design-system/components/stack-card';
import { JiraInstallationForm } from './install-form';

export const InstallJira = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    throw new Error('Organization not found');
  }

  const databaseOrganization = await database.organization.findFirst({
    where: { id: organizationId },
  });

  if (!databaseOrganization) {
    throw new Error('Organization not found');
  }

  const webhookUrl = new URL(
    `/webhooks/jira/${databaseOrganization.slug}`,
    env.EVERVERSE_API_URL
  );

  return (
    <>
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl">Install Jira</h1>
        <p className="mt-2 mb-0 text-muted-foreground">
          Follow the steps below to integrate Jira with Eververse. This assumes
          you already have a Atlassian account. If you don&apos;t, head to the{' '}
          <a
            href="https://www.atlassian.com/try/cloud/signup"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            Atlassian signup page
          </a>
          .
        </p>
      </div>
      <StackCard title="1. Create a webhook">
        <Prose className="max-w-none">
          <p>
            Head to the "WebHooks" page in your Atlassian account settings. The
            URL looks like this:
          </p>

          <div className="rounded-md bg-secondary px-4 py-3">
            <p>https://eververse.atlassian.net/plugins/servlet/webhooks</p>
          </div>

          <p>
            Create a new webhook with the name "Eververse" and the following
            endpoint URL:
          </p>

          <div className="rounded-md bg-secondary px-4 py-3">
            <p>{webhookUrl.toString()}</p>
          </div>

          <p>Then, select the following "Issue related events":</p>
          <ul>
            <li>
              <code>Issue updated</code>
            </li>
            <li>
              <code>Issue deleted</code>
            </li>
          </ul>

          <p>Then click "Create".</p>
        </Prose>
      </StackCard>
      <StackCard title="2. Create a new API token">
        <Prose className="max-w-none">
          <p>
            Head to the{' '}
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              API tokens page
            </a>{' '}
            and click "Create a new API token". Give it a name, like "Eververse"
            and select an expiration date. Then, press "Create".
          </p>
        </Prose>
      </StackCard>
      <StackCard title="3. Provide your app details">
        <Prose className="max-w-none">
          <p>Copy and paste the provided API token below:</p>

          <JiraInstallationForm />
        </Prose>
      </StackCard>
    </>
  );
};
