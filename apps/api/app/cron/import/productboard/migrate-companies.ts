import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateCompanies = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const companies = await productboard.company.list();

  const existingCompanies = await database.feedbackOrganization.findMany({
    where: { organizationId },
    select: { productboardId: true },
  });

  const newCompanies = companies.filter((company) => {
    const existing = existingCompanies.find(
      ({ productboardId }) => productboardId === company.id
    );

    return !existing;
  });

  const data: Prisma.FeedbackOrganizationCreateManyInput[] = newCompanies.map(
    (company) => ({
      name: company.name,
      organizationId,
      productboardId: company.id,
      domain: company.domain,
    })
  );

  await database.feedbackOrganization.createMany({
    data,
    skipDuplicates: true,
  });

  return newCompanies.length;
};
