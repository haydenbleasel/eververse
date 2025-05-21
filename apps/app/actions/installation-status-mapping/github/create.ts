'use server';

import { database } from '@/lib/database';
import { currentUser } from '@repo/backend/auth/utils';
import type { Prisma } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

const gitHubIssueActions = [
  'opened',
  'edited',
  'closed',
  'reopened',
  'assigned',
  'unassigned',
  'labeled',
  'unlabeled',
];

export const createGitHubStatusMappings = async (): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    const [defaultFeatureStatus, gitHubInstallation] = await Promise.all([
      database.featureStatus.findFirst({
        orderBy: { order: 'asc' },
        select: { id: true },
      }),
      database.gitHubInstallation.findFirst({
        select: {
          id: true,
          organizationId: true,
        },
      }),
    ]);

    if (!defaultFeatureStatus) {
      throw new Error('Default feature status not found');
    }

    if (!gitHubInstallation) {
      throw new Error('Installation not found');
    }

    const data: Prisma.InstallationStatusMappingCreateManyInput[] =
      gitHubIssueActions.map((action) => ({
        organizationId: gitHubInstallation.organizationId,
        featureStatusId: defaultFeatureStatus.id,
        creatorId: user.id,
        eventType: action,
        githubInstallationId: gitHubInstallation.id,
      }));

    await database.installationStatusMapping.createMany({
      data,
      skipDuplicates: true,
    });

    revalidatePath('/settings/integrations/github');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
