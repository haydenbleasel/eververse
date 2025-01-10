import { env } from '@/env';
import { database } from '@/lib/database';
import type { Prisma } from '@prisma/client';
import { createOauth2Client } from '@repo/atlassian';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { baseUrl } from '@repo/lib/consts';
import { log } from '@repo/observability/log';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Processing',
  description: 'Please wait while we process your request.',
});

type JiraCallbackPageProperties = {
  readonly searchParams: Promise<Record<string, string>>;
};

const unregisterWebhook = async (
  cloudId: string,
  accessToken: string
): Promise<void> => {
  const client = createOauth2Client({
    cloudId,
    accessToken,
  });

  try {
    const response = await client.GET('/rest/api/3/webhook');

    if (response.error) {
      throw new Error(
        `Failed to fetch webhooks: ${response.error.errorMessages?.join(', ')}`
      );
    }

    if (!response.data.values || response.data.values.length === 0) {
      return;
    }

    const deleteResponse = await client.DELETE('/rest/api/3/webhook', {
      body: {
        webhookIds: response.data.values.map((webhook) => webhook.id),
      },
    });

    if (deleteResponse.error) {
      throw new Error(
        `Failed to unregister webhooks: ${deleteResponse.error.errorMessages?.join(', ')}`
      );
    }
  } catch (error) {
    log.error(`🔗 Failed to unregister webhooks: ${error}`);
  }
};

const registerWebhook = async (
  cloudId: string,
  accessToken: string
): Promise<number> => {
  const response = await createOauth2Client({
    cloudId,
    accessToken,
  }).POST('/rest/api/3/webhook', {
    body: {
      // @ts-expect-error "Bad API Spec"
      name: 'Eververse',
      excludeBody: false,
      url: new URL('/webhooks/jira', env.EVERVERSE_API_URL).toString(),
      webhooks: [
        {
          events: [
            'jira:issue_updated',
            'jira:issue_deleted',
            /*
             * 'jira:issue_created',
             * 'comment_created',
             * 'comment_updated',
             * 'comment_deleted',
             * 'issue_property_set',
             * 'issue_property_deleted',
             */
          ],
          jqlFilter: 'project != ""',
        },
      ],
    },
  });

  if (response.error) {
    throw new Error(
      `Failed to register webhook: ${response.error.errorMessages?.join(', ')}`
    );
  }

  if (
    !response.data.webhookRegistrationResult ||
    response.data.webhookRegistrationResult.length === 0
  ) {
    throw new Error('Failed to register webhook: no response');
  }

  const [result] = response.data.webhookRegistrationResult;

  if (result.errors) {
    throw new Error(`Failed to register webhook: ${result.errors?.join(', ')}`);
  }

  if (!result.createdWebhookId) {
    throw new Error('Failed to register webhook: no webhook ID');
  }

  return result.createdWebhookId;
};

const JiraCallbackPage = async (props: JiraCallbackPageProperties) => {
  const searchParams = await props.searchParams;
  const { code, state } = searchParams;

  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId || !code || !state) {
    notFound();
  }

  log.info('🔗 Checking installation state...');
  const installationState = await database.installationState.count({
    where: {
      id: state,
      platform: 'ATLASSIAN',
      creatorId: user.id,
    },
  });

  if (!installationState) {
    log.error('🔗 State parameter is invalid');
    throw new Error('State parameter is invalid');
  }

  log.info('🔗 Deleting installation state...');
  await database.installationState.delete({
    where: { id: state },
    select: { id: true },
  });

  log.info('🔗 Fetching Atlassian access token...');
  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: env.ATLASSIAN_CLIENT_ID,
      client_secret: env.ATLASSIAN_CLIENT_SECRET,
      redirect_uri: new URL('/callbacks/jira', baseUrl).toString(),
    }),
  });

  if (!response.ok) {
    log.error('🔗 Failed to fetch Atlassian access token');
    const data = (await response.json()) as {
      error: string;
      error_description: string;
    };

    log.error(
      `🔗 Failed to fetch Atlassian access token: ${data.error_description}`
    );
    throw new Error(data.error_description);
  }

  log.info('🔗 Fetching Atlassian access token...');
  const text = await response.text();

  log.info('🔗 Parsing Atlassian access token...');
  const data = JSON.parse(text) as
    | {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        scope: string;
      }
    | {
        error: string;
        error_description: string;
      };

  if ('error' in data) {
    log.error(
      `🔗 Failed to fetch Atlassian access token: ${data.error_description}`
    );
    throw new Error(data.error_description);
  }

  log.info(`🔗 Found Atlassian access token: ${data.access_token}.`);

  log.info('🔗 Fetching Atlassian accessible resources...');
  const accessibleResources = await fetch(
    'https://api.atlassian.com/oauth/token/accessible-resources',
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${data.access_token}`,
      },
    }
  );

  if (!accessibleResources.ok) {
    log.error(
      `🔗 Failed to fetch Atlassian available resources: ${accessibleResources.statusText}`
    );
    throw new Error(accessibleResources.statusText);
  }

  log.info('🔗 Parsing Atlassian accessible resources...');
  const resources = (await accessibleResources.json()) as {
    id: string;
    name: string;
    url: string;
    scopes: string[];
    avatarUrl: string;
  }[];

  log.info(
    `🔗 Found ${resources.length} accessible resources: ${JSON.stringify(
      resources,
      null,
      2
    )}`
  );

  log.info('🔗 Verifying webhooks...');
  const webhookIds = await Promise.all(
    resources.map(async (resource) => {
      log.info(`🔗 Unregistering webhooks for ${resource.id}...`);
      await unregisterWebhook(resource.id, data.access_token);

      log.info(`🔗 Registering webhooks for ${resource.id}...`);
      return registerWebhook(resource.id, data.access_token);
    })
  );

  log.info('🔗 Creating new installation...');
  const newInstallation = await database.atlassianInstallation.create({
    data: {
      organizationId,
      creatorId: user.id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scope: data.scope,
      resources: {
        createMany: {
          data: resources.map((resource) => ({
            resourceId: resource.id,
            name: resource.name,
            url: resource.url,
            scopes: resource.scopes.join(','),
            avatarUrl: resource.avatarUrl,
            organizationId,
            creatorId: user.id,
          })),
          skipDuplicates: true,
        },
      },
      webhooks: {
        createMany: {
          data: webhookIds.map((webhookId, index) => ({
            organizationId,
            creatorId: user.id,
            webhookId,
            url: resources[index]?.url,
            resourceId: resources[index]?.id,
          })),
          skipDuplicates: true,
        },
      },
    },
    select: { id: true },
  });

  log.info(`🔗 Created new installation: ${newInstallation.id}.`);

  log.info('🔗 Checking for existing installation...');
  const existingInstallation = await database.atlassianInstallation.findFirst({
    where: {
      id: { not: newInstallation.id },
    },
    select: {
      id: true,
      fieldMappings: true,
      statusMappings: true,
      featureConnections: true,
    },
  });

  if (existingInstallation) {
    log.info('🔗 Migrating existing installation data...');
    const transactions: Prisma.PrismaPromise<unknown>[] = [];

    const fieldMappingTransactions =
      database.installationFieldMapping.updateMany({
        where: { atlassianInstallationId: existingInstallation.id },
        data: { atlassianInstallationId: newInstallation.id },
      });

    const statusMappingTransactions =
      database.installationStatusMapping.updateMany({
        where: { atlassianInstallationId: existingInstallation.id },
        data: { atlassianInstallationId: newInstallation.id },
      });

    const featureConnectionTransactions = database.featureConnection.updateMany(
      {
        where: { atlassianInstallationId: existingInstallation.id },
        data: { atlassianInstallationId: newInstallation.id },
      }
    );

    transactions.push(
      fieldMappingTransactions,
      statusMappingTransactions,
      featureConnectionTransactions
    );

    await database.$transaction(transactions);

    log.info('🔗 Deleting old installation...');
    await database.atlassianInstallation.delete({
      where: { id: existingInstallation.id },
    });
  }

  log.info('🔗 Checking for broken feature connections...');
  const [atlassianInstallations, brokenFeatureConnections, organization] =
    await Promise.all([
      database.atlassianInstallation.findMany({
        select: {
          id: true,
          resources: {
            select: {
              url: true,
            },
          },
        },
      }),
      database.featureConnection.findMany({
        where: {
          atlassianInstallationId: null,
          githubInstallationId: null,
          linearInstallationId: null,
        },
        select: {
          id: true,
          href: true,
        },
      }),
      database.organization.findUnique({
        where: { id: organizationId },
        select: { slug: true },
      }),
    ]);

  if (!organization) {
    notFound();
  }

  if (!atlassianInstallations.length || !brokenFeatureConnections.length) {
    return redirect('/settings/integrations/jira');
  }

  log.info('🔗 Migrating broken feature connections...');
  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  for (const featureConnection of brokenFeatureConnections) {
    const featureConnectionDomain = new URL(featureConnection.href).hostname;

    for (const installation of atlassianInstallations) {
      for (const resource of installation.resources) {
        const resourceDomain = new URL(resource.url).hostname;

        if (resourceDomain === featureConnectionDomain) {
          const transaction = database.featureConnection.update({
            where: { id: featureConnection.id },
            data: { atlassianInstallationId: installation.id },
          });

          transactions.push(transaction);
        }
      }
    }
  }

  await database.$transaction(transactions);

  return redirect('/settings/integrations/jira');
};

export default JiraCallbackPage;
