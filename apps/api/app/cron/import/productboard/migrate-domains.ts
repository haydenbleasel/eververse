import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { emailRegex } from '@repo/lib/email';
import { createClient } from '@repo/productboard';
import commonProviders from 'email-providers/all.json' assert { type: 'json' };

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateDomains = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });
  const users = await productboard.GET('/users', {
    params: {
      header: {
        'X-Version': 1,
      },
    },
  });

  if (users.error) {
    throw new Error(users.error.errors.map((error) => error.detail).join(', '));
  }

  if (!users.data.data) {
    throw new Error('No users found');
  }

  const existingCompanies = await database.feedbackOrganization.findMany({
    where: { organizationId },
    select: { domain: true },
  });

  const userDomains = new Set<string>();

  for (const user of users.data.data) {
    if (user.email && emailRegex.test(user.email)) {
      const [, domain] = user.email.split('@');

      if (domain) {
        userDomains.add(domain);
      }
    }
  }

  const newDomains = [...userDomains].filter(
    (domain) =>
      !existingCompanies.some((company) => company.domain === domain) &&
      !commonProviders.includes(domain)
  );

  const data: Prisma.FeedbackOrganizationCreateManyArgs['data'] =
    newDomains.map((domain) => ({
      domain,
      organizationId,
      name: domain,
    }));

  await database.feedbackOrganization.createMany({
    data,
    skipDuplicates: true,
  });

  return data.length;
};
