'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { MAX_FREE_RELEASES } from '@repo/lib/consts';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const createRelease = async (
  title: string,
  startAt: Date | undefined,
  endAt: Date | undefined
): Promise<{
  id?: string;
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
      throw new Error("You don't have permission to create a release");
    }

    const organization = await database.organization.findFirst({
      where: { id: organizationId },
      select: {
        stripeSubscriptionId: true,
        _count: {
          select: { releases: true },
        },
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    if (
      !organization.stripeSubscriptionId &&
      organization._count.releases >= MAX_FREE_RELEASES
    ) {
      throw new Error(
        'You have reached the maximum number of releases for your plan. Please upgrade to manage more releases.'
      );
    }

    const update = await database.release.create({
      data: {
        title,
        organizationId,
        creatorId: user.id,
        startAt,
        endAt,
      },
      select: { id: true },
    });

    revalidatePath('/release', 'layout');

    return { id: update.id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
