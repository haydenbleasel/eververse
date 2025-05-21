import { database } from '@repo/backend/database';
import type { CannyImport } from '@repo/backend/prisma/client';
import { Canny } from '@repo/canny';
import { friendlyWords } from 'friendlier-words';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateCompanies = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const companies = await canny.company.list();

  const existingCompanies = await database.feedbackOrganization.findMany({
    where: { organizationId },
    select: { cannyId: true },
  });

  const newCompanies = companies.filter((company) => {
    const existing = existingCompanies.find(
      ({ cannyId }) => cannyId === company.id
    );

    return !existing;
  });

  await database.feedbackOrganization.createMany({
    data: newCompanies.map((company) => ({
      name: company.name ?? friendlyWords(2, ' '),
      organizationId,
      cannyId: company.id,
      domain: company.domain,
    })),
    skipDuplicates: true,
  });

  return newCompanies.length;
};
