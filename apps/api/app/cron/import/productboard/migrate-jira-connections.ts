import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { log } from '@repo/observability/log';
import { createClient } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateJiraConnections = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });
  const jiraIntegrations = await productboard.GET('/jira-integrations', {
    params: {
      header: {
        'X-Version': 1,
      },
    },
  });

  if (jiraIntegrations.error) {
    throw new Error(
      jiraIntegrations.error.errors.map((error) => error.detail).join(', ')
    );
  }

  if (!jiraIntegrations.data) {
    throw new Error('No jira integrations found');
  }

  const jiraConnectionPromises = jiraIntegrations.data.data.map(
    async (integration) => {
      const response = await productboard.GET(
        '/jira-integrations/{id}/connections',
        {
          params: {
            path: {
              id: integration.id,
            },
            header: {
              'X-Version': 1,
            },
          },
        }
      );

      if (response.error) {
        throw new Error(
          response.error.errors.map((error) => error.detail).join(', ')
        );
      }

      return response.data.data;
    }
  );

  const jiraLinksRaw = await Promise.all(jiraConnectionPromises);
  const jiraLinks = jiraLinksRaw.flat();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      featureConnections: { select: { externalId: true } },
      features: { select: { id: true, productboardId: true } },
      atlassianInstallations: {
        take: 1,
        select: {
          id: true,
          siteUrl: true,
          email: true,
        },
      },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const data: Prisma.FeatureConnectionCreateManyInput[] = [];
  const baseUrl = databaseOrganization.atlassianInstallations.at(0)?.siteUrl;

  if (!baseUrl) {
    log.error('No Atlassian installation found, skipping...');
    return 0;
  }

  const newJiraLinks = jiraLinks.filter((link) => {
    const doesExist = databaseOrganization.featureConnections.find(
      ({ externalId }) => externalId === link.connection.issueId
    );

    return !doesExist;
  });

  for (const link of newJiraLinks) {
    const feature = databaseOrganization.features.find(
      ({ productboardId }) => productboardId === link.featureId
    );

    if (!feature) {
      throw new Error('Feature not found');
    }

    data.push({
      organizationId,
      externalId: link.connection.issueId,
      featureId: feature.id,
      href: new URL(`/browse/${link.connection.issueKey}`, baseUrl).toString(),
      type: 'JIRA',
    });
  }

  await database.featureConnection.createMany({
    data,
    skipDuplicates: true,
  });

  return data.length;
};
