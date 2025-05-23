'use server';

import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/src/parse-error';

export const createLinearInstallation = async (
  apiKey: string
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

    await database.linearInstallation.create({
      data: {
        organizationId,
        creatorId: user.id,
        apiKey,
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
