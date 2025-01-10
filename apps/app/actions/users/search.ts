'use server';

import { getUserName } from '@repo/backend/auth/format';
import { currentOrganizationId, getMembers } from '@repo/backend/auth/utils';
import { createFuse } from '@repo/lib/fuse';

export const searchUsers = async (
  query: string
): Promise<
  | {
      data: string[];
    }
  | {
      error: unknown;
    }
> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error('Not logged in');
    }

    const members = await getMembers(organizationId);

    const users = members.map((user) => ({
      id: user.id,
      name: getUserName(user),
      imageUrl: user.user_metadata.imageUrl ?? '',
    }));

    const fuse = createFuse(users, ['name']);
    const results = fuse.search(query);
    const data = results.map((result) => result.item.id);

    return { data };
  } catch (error) {
    return { error };
  }
};
