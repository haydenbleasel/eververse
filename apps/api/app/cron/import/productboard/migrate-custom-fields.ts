import { database } from "@repo/backend/database";
import type { Prisma, ProductboardImport } from "@repo/backend/prisma/client";
import { createClient } from "@repo/productboard";

type ImportJobProperties = Pick<
  ProductboardImport,
  "creatorId" | "organizationId" | "token"
>;

export const migrateCustomFields = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });
  const customFields = await productboard.GET(
    "/hierarchy-entities/custom-fields",
    {
      params: {
        query: {
          type: [
            "text",
            "dropdown",
            "multi-dropdown",
            "custom-description",
            "member",
            "number",
          ],
        },
        header: {
          "X-Version": 1,
        },
      },
    }
  );

  if (customFields.error) {
    throw new Error(
      customFields.error.errors.map((error) => error.detail).join(", ")
    );
  }

  if (!customFields.data) {
    throw new Error("No custom fields found");
  }

  const existingCustomFields = await database.featureCustomField.findMany({
    where: { organizationId },
    select: { productboardId: true },
  });

  const newCustomFields = customFields.data.data.filter((status) => {
    const existing = existingCustomFields.find(
      (field) => field.productboardId === status.id
    );

    return !existing;
  });

  const data: Prisma.FeatureCustomFieldCreateManyInput[] = newCustomFields.map(
    (customField) => ({
      name: customField.name,
      organizationId,
      description: customField.description,
      productboardId: customField.id,
    })
  );

  await database.featureCustomField.createMany({
    data,
    skipDuplicates: true,
  });

  return newCustomFields.length;
};
