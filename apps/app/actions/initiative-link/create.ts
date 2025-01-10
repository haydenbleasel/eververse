'use server';

import { database } from '@/lib/database';
import type { Initiative, InitiativeExternalLink } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const createInitiativeLink = async (
  initiativeId: Initiative['id'],
  title: InitiativeExternalLink['title'],
  href: InitiativeExternalLink['href']
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to create links");
    }

    await database.initiativeExternalLink.create({
      data: {
        organizationId,
        title,
        initiativeId,
        creatorId: user.id,
        href: href.startsWith('http') ? href : `https://${href}`,
      },
      select: {
        id: true,
      },
    });

    revalidatePath(`/initiatives/${initiativeId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
