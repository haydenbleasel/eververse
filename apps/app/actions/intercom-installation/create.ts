'use server';

import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/src/parse-error';

export const createIntercomInstallation = async (
  appId: string
): Promise<
  | {
      error: string;
    }
  | {
      success: true;
    }
> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('Unauthorized');
    }

    await database.intercomInstallation.create({
      data: {
        organizationId,
        creatorId: user.id,
        appId,
      },
      select: {
        organization: {
          select: {
            slug: true,
          },
        },
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
