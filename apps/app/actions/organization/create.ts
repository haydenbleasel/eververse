'use server';

import { EververseRole } from '@repo/backend/auth';
import { createClient } from '@repo/backend/auth/server';
import { currentUser } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { parseError } from '@repo/lib/parse-error';
import { slugify } from '@repo/lib/slugify';
import { tailwind } from '@repo/tailwind-config';

type CreateOrganizationProps = {
  name: string;
  productDescription: string;
};

export const createOrganization = async ({
  name,
  productDescription,
}: CreateOrganizationProps): Promise<
  | { id: string }
  | {
      error: string;
    }
> => {
  try {
    const supabase = await createClient();
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    let slug = slugify(name);

    const existingOrganization = await database.organization.findFirst({
      where: { slug },
    });

    if (existingOrganization) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const organization = await database.organization.create({
      data: {
        name,
        slug,
        productDescription,
        featureStatuses: {
          createMany: {
            data: [
              {
                name: 'Backlog',
                color: tailwind.theme.colors.rose[500],
                order: 0,
              },
              {
                name: 'In Progress',
                color: tailwind.theme.colors.yellow[500],
                order: 1,
              },
              {
                name: 'Completed',
                color: tailwind.theme.colors.emerald[500],
                order: 2,
                complete: true,
              },
            ],
          },
        },
      },
      select: { id: true },
    });

    const response = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        organization_id: organization.id,
        organization_role: EververseRole.Admin,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return { id: organization.id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
