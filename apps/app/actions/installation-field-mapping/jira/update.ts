'use server';

import { database } from '@/lib/database';
import type {
  AtlassianInstallation,
  InstallationFieldMapping,
  Prisma,
} from '@prisma/client';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { log } from '@repo/observability/log';
import { revalidatePath } from 'next/cache';

export const updateJiraFieldMappings = async (
  installationId: AtlassianInstallation['id'],
  internal: {
    id: InstallationFieldMapping['internalId'];
    type: InstallationFieldMapping['internalType'];
  },
  externals: {
    id: InstallationFieldMapping['externalId'];
    type: InstallationFieldMapping['externalType'];
  }[]
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('Not logged in');
    }

    log.info(
      `Deleting existing Jira field mappings for installation ${installationId} and internal id ${internal.id}`
    );

    // 1. Delete existing mappings for the feature status
    await database.installationFieldMapping.deleteMany({
      where: {
        atlassianInstallationId: installationId,
        internalId: internal.id,
      },
    });

    log.info(
      `Creating new Jira field mappings for installation ${installationId} and internal id ${internal.id}: ${JSON.stringify(
        externals,
        null,
        2
      )}`
    );

    const data: Prisma.InstallationFieldMappingCreateManyInput[] =
      externals.map((external) => ({
        organizationId,
        atlassianInstallationId: installationId,
        internalId: internal.id,
        internalType: internal.type,
        externalId: external.id,
        externalType: external.type,
        creatorId: user.id,
      }));

    // 2. Create new mappings for the feature status
    await database.installationFieldMapping.createMany({
      data,
      skipDuplicates: true,
    });

    revalidatePath('/settings/integrations/jira');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
