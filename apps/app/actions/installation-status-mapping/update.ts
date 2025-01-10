'use server';

import { database } from '@/lib/database';
import type { InstallationStatusMapping } from '@prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateInstallationStatusMapping = async (
  connectionId: InstallationStatusMapping['id'],
  data: Partial<InstallationStatusMapping>
): Promise<{
  error?: string;
}> => {
  try {
    await database.installationStatusMapping.update({
      where: { id: connectionId },
      data,
      select: { id: true },
    });

    revalidatePath('/settings/integrations/github');
    revalidatePath('/settings/integrations/jira');
    revalidatePath('/settings/integrations/linear');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
