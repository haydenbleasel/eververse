'use server';

import { database } from '@repo/backend/database';
import { parseError } from '@repo/lib/src/parse-error';

export const deleteLinearInstallation = async (
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
    const installation = await database.linearInstallation.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!installation) {
      throw new Error('Linear installation not found');
    }

    await database.linearInstallation.delete({
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
