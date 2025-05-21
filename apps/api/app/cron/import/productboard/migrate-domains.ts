import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { emailRegex } from '@repo/lib/email';
import { Productboard } from '@repo/productboard';
import commonProviders from 'email-providers/all.json' assert { type: 'json' };

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateDomains = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const users = await productboard.user.list();

  const existingCompanies = await database.feedbackOrganization.findMany({
    where: { organizationId },
    select: { domain: true },
  });

  const userDomains = new Set<string>();

  for (const user of users) {
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
