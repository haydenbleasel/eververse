'use server';

import { database } from '@/lib/database';
import type { ApiKey } from '@prisma/client';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';

export const createAPIKey = async (
  name: ApiKey['name']
): Promise<{
  error?: string;
  key?: ApiKey['key'];
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('User or organization not found');
    }

    const { key } = await database.apiKey.create({
      data: {
        name,
        creatorId: user.id,
        organizationId,
      },
      select: { key: true },
    });

    return { key };
  } catch (error) {
    const message = parseError(error);

    return {
      error: message,
    };
  }
};
