'use server';

import { database } from '@/lib/database';
import type { Organization } from '@prisma/client';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateOrganization = async (
  data: Partial<Organization>
): Promise<{
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error('Not logged in');
    }

    await database.organization.update({
      where: { id: organizationId },
      data,
      select: { id: true },
    });

    revalidatePath('/', 'layout');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
