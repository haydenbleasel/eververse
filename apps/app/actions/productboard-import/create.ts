'use server';

import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import type { productboard_import_job_type } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { createClient } from '@repo/productboard';
import { revalidatePath } from 'next/cache';

const types: productboard_import_job_type[] = [
  'PRODUCTS',
  'COMPONENTS',
  'FEATURE_STATUSES',
  'FEATURES',
  'CUSTOM_FIELDS',
  'CUSTOM_FIELD_VALUES',
  'COMPANIES',
  'DOMAINS',
  'USERS',
  'TAGS',
  'NOTES',
  'NOTE_TAGS',
  'RELEASES',
  'FEATURE_RELEASE_ASSIGNMENTS',
  'JIRA_CONNECTIONS',
  'NOTE_CONNECTIONS',
];

export const productboardImport = async (
  token: string
): Promise<
  | {
      error: string;
    }
  | {
      id: string;
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

    try {
      const productboard = createClient({
        accessToken: token,
      });

      await productboard.GET('/users', {
        params: {
          header: {
            'X-Version': 1,
          },
        },
      });
    } catch {
      throw new Error('Please provide a valid Productboard token.');
    }

    const { id } = await database.productboardImport.create({
      data: {
        organizationId,
        token,
        creatorId: user.id,
        jobs: {
          create: types.map((type, index) => ({
            order: index,
            type,
            organizationId,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    const organization = await database.organization.findUnique({
      where: { id: organizationId },
      select: { onboardingType: true },
    });

    if (!organization?.onboardingType) {
      await database.organization.update({
        where: { id: organizationId },
        data: {
          onboardingType: 'IMPORT',
          onboardedAt: new Date(),
        },
        select: {
          id: true,
        },
      });
    }

    revalidatePath('/settings/import/productboard');

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
