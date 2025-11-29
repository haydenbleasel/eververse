import { getMembers } from "@repo/backend/auth/utils";
import { database } from "@repo/backend/database";
import type { Prisma, ProductboardImport } from "@repo/backend/prisma/client";
import { markdownToContent } from "@repo/editor/lib/tiptap";
import { createClient } from "@repo/productboard";

type ImportJobProperties = Pick<
  ProductboardImport,
  "creatorId" | "organizationId" | "token"
>;

export const migrateFeatures = async ({
  creatorId,
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });
  const features = await productboard.GET("/features", {
    params: {
      header: {
        "X-Version": 1,
      },
    },
  });

  if (features.error) {
    throw new Error(
      features.error.errors.map((error) => error.detail).join(", ")
    );
  }

  if (!features.data) {
    throw new Error("No features found");
  }

  const members = await getMembers(organizationId);
  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      features: { select: { productboardId: true, id: true } },
      products: { select: { productboardId: true, id: true } },
      groups: { select: { productboardId: true, id: true } },
      featureStatuses: { select: { productboardId: true, id: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error("Could not find organization");
  }

  const rootFeatures: typeof features.data.data = [];
  const subFeatures: typeof features.data.data = [];
  const newFeatures = features.data.data
    .filter((feature) => {
      const existing = databaseOrganization.features.find(
        ({ productboardId }) => productboardId === feature.id
      );

      return !existing;
    })
    .sort((featureA, featureB) => {
      if ("feature" in featureA.parent) {
        return 1;
      }

      if ("feature" in featureB.parent) {
        return -1;
      }

      return 0;
    });

  for (const feature of newFeatures) {
    if ("feature" in feature.parent) {
      subFeatures.push(feature);
    } else {
      rootFeatures.push(feature);
    }
  }

  for (const data of [rootFeatures, subFeatures]) {
    const newExistingFeatures = await database.feature.findMany({
      where: { organizationId },
      select: {
        productboardId: true,
        id: true,
        productId: true,
        groupId: true,
      },
    });

    const promises = data.map(async (feature) => {
      const owner = members.find(({ email }) => email === feature.owner?.email);

      const startAt =
        feature.timeframe.startDate === "none"
          ? undefined
          : new Date(feature.timeframe.startDate);
      const endAt =
        feature.timeframe.endDate === "none"
          ? undefined
          : new Date(feature.timeframe.endDate);

      let parentProductId =
        "product" in feature.parent ? feature.parent.product.id : null;
      let parentComponentId =
        "component" in feature.parent ? feature.parent.component.id : null;
      const parentFeatureId =
        "feature" in feature.parent ? feature.parent.feature.id : null;

      // If the feature is missing a product, but has a parent feature, we can use the parent feature's product.
      if (!parentProductId && parentFeatureId) {
        const parentFeature = newExistingFeatures.find(
          ({ productboardId }) => productboardId === parentFeatureId
        );

        if (parentFeature?.productId) {
          const parentProduct = databaseOrganization.products.find(
            ({ productboardId }) => productboardId === parentFeature.productId
          );

          if (parentProduct) {
            parentProductId = parentProduct.productboardId;
          }
        }
      }

      // If the feature is missing a component, but has a parent feature, we can use the parent feature's component.
      if (!parentComponentId && parentFeatureId) {
        const parentFeature = newExistingFeatures.find(
          ({ productboardId }) => productboardId === parentFeatureId
        );

        if (parentFeature?.groupId) {
          const parentComponent = databaseOrganization.groups.find(
            ({ productboardId }) => productboardId === parentFeature.groupId
          );

          if (parentComponent) {
            parentComponentId = parentComponent.productboardId;
          }
        }
      }

      const productId = databaseOrganization.products.find(
        ({ productboardId }) => productboardId === parentProductId
      )?.id;

      if (parentProductId && !productId) {
        throw new Error(`Could not find product for ${parentProductId}`);
      }

      const groupId = databaseOrganization.groups.find(
        ({ productboardId }) => productboardId === parentComponentId
      )?.id;

      if (parentComponentId && !groupId) {
        throw new Error(`Could not find component for ${parentComponentId}`);
      }

      const newParentFeatureId = newExistingFeatures.find(
        ({ productboardId }) => productboardId === parentFeatureId
      )?.id;

      if (parentFeatureId && !newParentFeatureId) {
        throw new Error(`Could not find parent feature for ${parentFeatureId}`);
      }

      const statusId = databaseOrganization.featureStatuses.find(
        ({ productboardId }) => productboardId === feature.status.id
      )?.id;

      if (feature.status.id && !statusId) {
        throw new Error(`Could not find status for ${feature.status.id}`);
      }

      if (!statusId) {
        throw new Error(`Could not find status for ${feature.status.id}`);
      }

      const input: Prisma.FeatureCreateManyInput = {
        creatorId,
        organizationId,
        ownerId: owner ? owner.id : creatorId,
        title: feature.name,
        createdAt: new Date(feature.createdAt),
        startAt,
        endAt,
        productboardId: feature.id,
        productId,
        groupId,
        parentFeatureId: newParentFeatureId,
        statusId,
        content: await markdownToContent(feature.description),
      };

      return input;
    });

    const transactions = await Promise.all(promises);

    await database.feature.createMany({
      data: transactions,
      skipDuplicates: true,
    });
  }

  return newFeatures.length;
};
