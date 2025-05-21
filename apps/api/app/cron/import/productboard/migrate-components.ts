import { getMembers } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

type ProductboardComponent = Awaited<
  ReturnType<Productboard['component']['list']>
>[number];

export const migrateComponents = async ({
  creatorId,
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const components = await productboard.component.list();
  const members = await getMembers(organizationId);
  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      products: { select: { productboardId: true, id: true } },
      groups: { select: { productboardId: true, id: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const calculateDepth = (component: ProductboardComponent) => {
    let parentDepth = 0;

    if ('component' in component.parent) {
      const parentComponentId = component.parent.component.id;
      const parent = components.find(({ id }) => id === parentComponentId);

      if (!parent) {
        throw new Error(
          `Could not find parent component ${component.parent.component.id}`
        );
      }

      parentDepth = calculateDepth(parent);
    }

    return parentDepth + 1;
  };

  const newComponents = components.filter((component) => {
    const existing = databaseOrganization.groups.find(
      ({ productboardId }) => productboardId === component.id
    );

    return !existing;
  });

  const componentsGroupedByDepth = newComponents
    .sort((componentA, componentB) => {
      const componentADepth = calculateDepth(componentA);
      const componentBDepth = calculateDepth(componentB);

      return componentADepth > componentBDepth ? 1 : -1;
    })
    .reduce<Record<number, ProductboardComponent[]>>(
      (accumulator, component) => {
        const depth = calculateDepth(component);

        if (!Object.hasOwn(accumulator, depth)) {
          accumulator[depth] = [];
        }

        accumulator[depth].push(component);

        return accumulator;
      },
      {}
    );

  for (const [, data] of Object.entries(componentsGroupedByDepth)) {
    const newGroups = await database.group.findMany({
      where: { organizationId },
      select: { productboardId: true, id: true, productId: true },
    });

    const properties = data.map((component) => {
      const owner = members.find(
        ({ email }) => email === component.owner.email
      );

      let productId: string | undefined;

      if ('product' in component.parent) {
        const parentProductId = component.parent.product.id;
        productId = databaseOrganization.products.find(
          ({ productboardId }) => productboardId === parentProductId
        )?.id;
      }

      const parentComponentId =
        'component' in component.parent
          ? component.parent.component.id
          : undefined;

      const relevantComponent = newGroups.find(
        ({ productboardId }) => productboardId === parentComponentId
      );

      if (!productId && !relevantComponent?.id) {
        throw new Error(
          `Could not find product or component for ${component.id}`
        );
      }

      const input: Prisma.GroupCreateManyInput = {
        name: component.name,
        productboardId: component.id,
        organizationId,
        creatorId,
        ownerId: owner?.id,
        productId: productId ?? relevantComponent?.productId,
        parentGroupId: relevantComponent?.id,
        createdAt: new Date(component.createdAt),
      };

      return input;
    });

    await database.group.createMany({
      data: properties,
      skipDuplicates: true,
    });
  }

  return newComponents.length;
};
