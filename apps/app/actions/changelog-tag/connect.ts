'use server';

import { database } from '@/lib/database';
import type { Changelog, ChangelogTag } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type AddChangelogTagProperties = {
  changelogId: Changelog['id'];
  changelogTagId: ChangelogTag['id'];
};

export const addChangelogTag = async ({
  changelogId,
  changelogTagId,
}: AddChangelogTagProperties): Promise<{
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
      throw new Error('You do not have permission to add tags');
    }

    await database.changelog.update({
      where: { id: changelogId },
      data: {
        tags: {
          connect: {
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
