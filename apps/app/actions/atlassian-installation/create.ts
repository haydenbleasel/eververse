'use server';

import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/src/parse-error';

type CreateAtlassianInstallationProperties = {
  accessToken: string;
  email: string;
  siteUrl: string;
};

export const createAtlassianInstallation = async ({
  accessToken,
  email,
  siteUrl,
}: CreateAtlassianInstallationProperties): Promise<
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

    await database.atlassianInstallation.create({
      data: {
        organizationId,
        creatorId: user.id,
        accessToken,
        email,
        siteUrl,
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
