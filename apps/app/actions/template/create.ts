'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type { Feature, Template } from '@repo/backend/prisma/client';
import { textToContent } from '@repo/editor/lib/tiptap';
import { parseError } from '@repo/lib/parse-error';

export const createTemplate = async (
  title: Template['title'],
  description: Template['description'],
  content?: object
): Promise<
  | {
      id: Template['id'];
    }
  | {
      error: string;
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
      throw new Error(
        "You don't have permission to create templates for this organization"
      );
    }

    const { id } = await database.template.create({
      data: {
        title,
        description,
        organizationId,
        creatorId: user.id,
        content: content ?? textToContent(''),
      },
      select: {
        id: true,
      },
    });

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};

export const createTemplateFromFeature = async (
  featureId: Feature['id'],
  title: Template['title'],
  description: Template['description']
): Promise<
  | object
  | {
      error: string;
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
      throw new Error(
        "You don't have permission to create templates for this organization"
      );
    }

    const feature = await database.feature.findUnique({
      where: { id: featureId },
      select: {
        id: true,
      },
    });

    if (!feature) {
      throw new Error('Feature not found');
    }

    const content = await getJsonColumnFromTable(
      'feature',
      'content',
      feature.id
    );

    await database.template.create({
      data: {
        title,
        description,
        organizationId,
        creatorId: user.id,
        content: content ?? textToContent(''),
      },
    });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
