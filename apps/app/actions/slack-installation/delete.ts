'use server';

import { database } from '@repo/backend/database';
import { parseError } from '@repo/lib/src/parse-error';

export const deleteSlackInstallation = async (
  id: string
): Promise<
  | {
      error: string;
    }
  | {
      success: true;
    }
> => {
  try {
    const installation = await database.slackInstallation.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!installation) {
      throw new Error('Slack installation not found');
    }

    await database.slackInstallation.delete({
      where: { id },
      select: { id: true },
    });

    return {
      success: true,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
