'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import type { Changelog, ChangelogTag } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type RemoveChangelogTagProperties = {
  changelogId: Changelog['id'];
  changelogTagId: ChangelogTag['id'];
};

export const removeChangelogTag = async ({
  changelogId,
  changelogTagId,
}: RemoveChangelogTagProperties): Promise<{
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

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error('You do not have permission to remove changelog tags');
    }

    await database.changelog.update({
      where: {
        id: changelogId,
      },
      data: {
        tags: {
          disconnect: {
            id: changelogTagId,
          },
        },
      },
    });

    revalidatePath(`/changelog/${changelogId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
