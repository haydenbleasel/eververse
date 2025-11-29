import { database } from "@repo/backend/database";
import type { Prisma, ProductboardImport } from "@repo/backend/prisma/client";
import { colors } from "@repo/design-system/lib/colors";
import { createClient } from "@repo/productboard";

type ImportJobProperties = Pick<
  ProductboardImport,
  "creatorId" | "organizationId" | "token"
>;

export const migrateFeatureStatuses = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });
  const featureStatuses = await productboard.GET("/feature-statuses", {
    params: {
      header: {
        "X-Version": 1,
      },
    },
  });

  if (featureStatuses.error) {
    throw new Error(
      featureStatuses.error.errors.map((error) => error.detail).join(", ")
    );
  }

  if (!featureStatuses.data) {
    throw new Error("No feature statuses found");
  }

  const existingFeatureStatuses = await database.featureStatus.findMany({
    where: { organizationId },
    select: { productboardId: true, name: true },
  });

  const data: Prisma.FeatureStatusCreateManyInput[] = featureStatuses.data.data
    .filter((status) => {
      const existing = existingFeatureStatuses.find(
        (feedback) => feedback.productboardId === status.id
      );

      return !existing;
    })
    .map((status, index) => ({
      name:
        existingFeatureStatuses.find(
          (feedback) => feedback.productboardId === status.id
        )?.name ?? `${status.name} (Productboard)`,
      organizationId,
      complete: status.completed,
      productboardId: status.id,
      color: status.completed ? colors.emerald : undefined,
      order: existingFeatureStatuses.length + index,
    }));

  await database.featureStatus.createMany({
    data,
    skipDuplicates: true,
  });

  return data.length;
};
