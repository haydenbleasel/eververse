import { database } from "@repo/backend/database";
import type { Prisma, ProductboardImport } from "@repo/backend/prisma/client";
import { createClient } from "@repo/productboard";

type ImportJobProperties = Pick<
  ProductboardImport,
  "creatorId" | "organizationId" | "token"
>;

export const migrateCompanies = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });

  const companies = await productboard.GET("/companies", {
    params: {
      header: {
        "X-Version": 1,
      },
    },
  });

  if (companies.error) {
    throw new Error(companies.error.detail);
  }

  if (!companies.data) {
    throw new Error("No companies found");
  }

  const existingCompanies = await database.feedbackOrganization.findMany({
    where: { organizationId },
    select: { productboardId: true },
  });

  const newCompanies = companies.data.data.filter((company) => {
    const existing = existingCompanies.find(
      ({ productboardId }) => productboardId === company.id
    );

    return !existing;
  });

  const data: Prisma.FeedbackOrganizationCreateManyInput[] = newCompanies.map(
    (company) => ({
      name: company.name ?? "Unknown company",
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
