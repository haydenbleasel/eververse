import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { log } from '@repo/observability/log';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateJiraConnections = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const jiraIntegrations = await productboard.jiraIntegration.list();
  const jiraLinksRaw = await Promise.all(
    jiraIntegrations.map(async (integration) =>
      productboard.jiraLink.list(integration.id)
    )
  );
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
          resources: {
            select: {
              url: true,
            },
          },
        },
      },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const data: Prisma.FeatureConnectionCreateManyInput[] = [];
  const baseUrl = databaseOrganization.atlassianInstallations
    .at(0)
    ?.resources.at(0)?.url;

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
      atlassianInstallationId:
        databaseOrganization.atlassianInstallations.at(0)?.id,
    });
  }

  await database.featureConnection.createMany({
    data,
    skipDuplicates: true,
  });

  return data.length;
};
