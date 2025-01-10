'use server';

import { database } from '@/lib/database';
import type { Feature, Template } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateTemplate = async (
  id: Template['id'],
  data: Omit<Partial<Template>, 'content'> & {
    content?: object;
  }
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update templates");
    }

    await database.template.update({
      where: { id },
      data,
    });

    revalidatePath('/settings/templates');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};

export const updateTemplateFromFeature = async (
  templateId: Template['id'],
  featureId: Feature['id']
): Promise<
  | object
  | {
      error: string;
    }
> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update templates");
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

    if (!content) {
      throw new Error('Content not found');
    }

    await updateTemplate(templateId, { content });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
