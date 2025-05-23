'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';

export const deleteAtlassianInstallation = async (): Promise<
  | {
      error: string;
    }
  | {
      success: true;
    }
> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        'You do not have permission to delete Atlassian installations'
      );
    }

    const atlassianInstallation =
      await database.atlassianInstallation.findFirst({
        select: {
          id: true,
          accessToken: true,
          email: true,
          siteUrl: true,
        },
      });

    if (!atlassianInstallation) {
      throw new Error('Installation not found');
    }

    await database.atlassianInstallation.delete({
      where: { id: atlassianInstallation.id },
      select: { id: true },
    });

    return { success: true };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
