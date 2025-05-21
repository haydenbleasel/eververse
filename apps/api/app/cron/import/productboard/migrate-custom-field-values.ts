import { getMembers } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { log } from '@repo/observability/log';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateCustomFieldValues = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const [databaseOrganization, members] = await Promise.all([
    database.organization.findUnique({
      where: { id: organizationId },
      select: {
        featureCustomFields: {
          where: { productboardId: { not: null } },
          select: { productboardId: true, id: true },
        },
        features: { select: { productboardId: true, id: true } },
      },
    }),
    getMembers(organizationId),
  ]);

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const productboard = new Productboard(token);

  const customFieldValuesRaw = await Promise.all(
    databaseOrganization.featureCustomFields.map(async (customField) =>
      productboard.customFieldValue.list(customField.productboardId ?? '')
    )
  );
  const customFieldValues = customFieldValuesRaw.flat();

  log.info(
    `⏬ Migrating ${customFieldValues.length} values for ${databaseOrganization.featureCustomFields.length} custom fields`
  );

  const getMemberByEmail = (email: string): string | null =>
    members.find((member) => member.email === email)?.id ?? null;

  const featureCustomFields = customFieldValues.filter(
    (customFieldValue) => customFieldValue.hierarchyEntity.type === 'feature'
  );

  for (const customFieldValue of featureCustomFields) {
    const featureId = databaseOrganization.features.find(
      (feature) =>
        feature.productboardId === customFieldValue.hierarchyEntity.id
    )?.id;

    if (!featureId) {
      log.error(
        `Feature with Productboard ID ${customFieldValue.hierarchyEntity.id} not found`
      );
      continue;
    }

    const customFieldId = databaseOrganization.featureCustomFields.find(
      (customField) =>
        customField.productboardId === customFieldValue.customField.id
    )?.id;

    if (!customFieldId) {
      log.error(
        `Custom field with Productboard ID ${customFieldValue.customField.id} not found`
      );
      continue;
    }

    let parsedValue: string | null = null;

    switch (customFieldValue.type) {
      case 'text':
      case 'custom-description': {
        parsedValue = customFieldValue.value;
        break;
      }
      case 'number': {
        parsedValue = customFieldValue.value?.toString() ?? null;
        break;
      }
      case 'dropdown': {
        parsedValue = customFieldValue.value?.id ?? null;
        break;
      }
      case 'multi-dropdown': {
        parsedValue = customFieldValue.value
          ? customFieldValue.value.map((option) => option.id).join(', ')
          : null;
        break;
      }
      case 'member': {
        parsedValue = customFieldValue.value?.email
          ? getMemberByEmail(customFieldValue.value.email)
          : null;
        break;
      }
      default: {
        continue;
      }
    }

    if (parsedValue === null) {
      continue;
    }

    const transaction = database.featureCustomFieldValue.create({
      data: {
        value: parsedValue,
        featureId,
        customFieldId,
        organizationId,
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
