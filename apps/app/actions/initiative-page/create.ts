'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import type { Initiative, InitiativePage } from '@repo/backend/prisma/client';
import { MAX_FREE_INITIATIVE_PAGES } from '@repo/lib/consts';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const createInitiativePage = async (
  initiativeId: Initiative['id'],
  title: InitiativePage['title'],
  type: string
): Promise<
  | {
      error: string;
    }
  | {
      id: InitiativePage['id'];
    }
> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to create pages");
    }

    const [existingPages, organization] = await Promise.all([
      database.initiativePage.findMany({
        where: { initiativeId },
      }),
      database.organization.findUnique({
        where: { id: organizationId },
      }),
    ]);

    if (!organization) {
      throw new Error('Organization not found');
    }

    if (
      !organization.stripeSubscriptionId &&
      existingPages.length >= MAX_FREE_INITIATIVE_PAGES
    ) {
      throw new Error('Upgrade to create more initiative pages');
    }

    let pageId = '';

    if (type === 'document') {
      const page = await database.initiativePage.create({
        data: {
          organizationId: organization.id,
          title,
          initiativeId,
          creatorId: user.id,
        },
        select: {
          id: true,
        },
      });

      pageId = page.id;
    }

    if (type === 'canvas') {
      const page = await database.initiativeCanvas.create({
        data: {
          organizationId: organization.id,
          title,
          initiativeId,
          creatorId: user.id,
          content: {},
        },
        select: {
          id: true,
        },
      });

      pageId = page.id;
    }

    revalidatePath(`/initiatives/${initiativeId}`);

    return { id: pageId };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
