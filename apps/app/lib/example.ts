import { database } from '@/lib/database';
import data from '@emoji-mart/data';
import { faker } from '@faker-js/faker';
import type { Prisma } from '@repo/backend/prisma/client';
import { textToContent } from '@repo/editor/lib/tiptap';

const castedData = data as { emojis: Record<string, string> };
const emojis = Object.keys(castedData.emojis);

export const createExampleFeedbackOrganizations = async (
  organizationId: string
): Promise<string[]> => {
  const ids = Array.from(
    { length: 10 },
    (_item, index) => `feedback-organization-example-${organizationId}-${index}`
  );

  await database.feedbackOrganization.createMany({
    data: ids.map((id) => {
      const input: Prisma.FeedbackOrganizationCreateManyInput = {
        name: faker.company.name(),
        organizationId,
        createdAt: faker.date.recent({ days: 5 }),
        domain: faker.internet.domainName(),
        id,
        updatedAt: faker.date.recent({ days: 5 }),
        example: true,
      };

      return input;
    }),
    skipDuplicates: true,
  });

  return ids;
};

export const createExampleFeedbackUsers = async (
  organizationId: string,
  feedbackOrgIds: string[]
): Promise<string[]> => {
  const ids = Array.from(
    { length: 20 },
    (_item, index) => `feedback-user-example-${organizationId}-${index}`
  );

  await database.feedbackUser.createMany({
    data: ids.map((id) => {
      const input: Prisma.FeedbackUserCreateManyInput = {
        id,
        email: faker.internet.email(),
        imageUrl: faker.image.avatarGitHub(),
        name: faker.person.fullName(),
        organizationId,
        feedbackOrganizationId: faker.helpers.arrayElement(feedbackOrgIds),
        createdAt: faker.date.recent({ days: 5 }),
        updatedAt: faker.date.recent({ days: 5 }),
        example: true,
      };

      return input;
    }),
    skipDuplicates: true,
  });

  return ids;
};

export const createExampleFeedbacks = async (
  organizationId: string,
  feedbackUserIds: string[]
): Promise<string[]> => {
  const ids = Array.from(
    { length: 20 },
    (_item, index) => `feedback-example-${organizationId}-${index}`
  );

  await database.feedback.createMany({
    data: ids.map((id) => {
      const body = faker.lorem.paragraphs(5);

      const input: Prisma.FeedbackCreateManyInput = {
        id,
        content: textToContent(body),
        organizationId,
        title: faker.company.catchPhrase(),
        createdAt: faker.date.recent({ days: 5 }),
        feedbackUserId: faker.helpers.arrayElement(feedbackUserIds),
        updatedAt: faker.date.recent({ days: 5 }),
        example: true,
        processed: true,
      };

      return input;
    }),
    skipDuplicates: true,
  });

  return ids;
};

export const createExampleProducts = async (
  organizationId: string,
  userId: string
): Promise<string[]> => {
  const ids = Array.from(
    { length: 5 },
    (_item, index) => `product-example-${organizationId}-${index}`
  );

  await database.product.createMany({
    data: ids.map((id) => {
      const input: Prisma.ProductCreateManyInput = {
        creatorId: userId,
        name: faker.commerce.productName(),
        organizationId,
        createdAt: faker.date.recent({ days: 5 }),
        emoji: faker.helpers.arrayElement(emojis),
        id,
        ownerId: userId,
        updatedAt: faker.date.recent({ days: 5 }),
        example: true,
      };

      return input;
    }),
    skipDuplicates: true,
  });

  return ids;
};

export const createExampleFeatures = async (
  organizationId: string,
  userId: string,
  statusIds: string[],
  productIds: string[],
  releaseIds: string[]
): Promise<string[]> => {
  const ids = Array.from(
    { length: 20 },
    (_item, index) => `feature-example-${organizationId}-${index}`
  );

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const body = faker.lorem.paragraphs(5);

  for (const id of ids) {
    const transaction = database.feature.create({
      data: {
        creatorId: userId,
        organizationId,
        ownerId: userId,
        statusId: faker.helpers.arrayElement(statusIds),
        title: faker.company.catchPhrase(),
        createdAt: faker.date.recent({ days: 5 }),
        endAt: faker.date.soon({ days: 60 }),
        id,
        productId: faker.helpers.arrayElement(productIds),
        example: true,
        releaseId: faker.helpers.arrayElement(releaseIds),
        rice: {
          create: {
            reach: faker.number.int({ min: 20, max: 100 }),
            confidence: faker.number.int({ min: 0, max: 100 }),
            impact: faker.number.int({ min: 1, max: 5 }),
            effort: faker.number.int({ min: 1, max: 5 }),
            organizationId,
          },
        },
        startAt: faker.date.recent({ days: 30 }),
        updatedAt: faker.date.recent({ days: 5 }),
        content: textToContent(body),
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return ids;
};

export const createExampleChangelogs = async (
  organizationId: string,
  userId: string
): Promise<string[]> => {
  const ids = Array.from(
    { length: 5 },
    (_item, index) => `changelog-example-${organizationId}-${index}`
  );

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const body = faker.lorem.paragraphs(5);

  for (const id of ids) {
    const transaction = database.changelog.create({
      data: {
        creatorId: userId,
        organizationId,
        title: faker.company.catchPhrase(),
        createdAt: faker.date.recent({ days: 5 }),
        id,
        updatedAt: faker.date.recent({ days: 5 }),
        example: true,
        content: textToContent(body),
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return ids;
};

export const createExampleReleases = async (
  organizationId: string,
  userId: string
): Promise<string[]> => {
  const ids = Array.from(
    { length: 5 },
    (_item, index) => `release-example-${organizationId}-${index}`
  );

  await database.release.createMany({
    data: ids.map((id) => ({
      creatorId: userId,
      organizationId,
      title: faker.company.catchPhrase(),
      createdAt: faker.date.recent({ days: 5 }),
      id,
      updatedAt: faker.date.recent({ days: 5 }),
      example: true,
      description: faker.lorem.paragraphs(1),
      endAt: faker.date.soon({ days: 60 }),
      startAt: faker.date.recent({ days: 30 }),
      state: faker.helpers.arrayElement([
        'PLANNED',
        'ACTIVE',
        'COMPLETED',
        'CANCELLED',
      ]),
    })),
    skipDuplicates: true,
  });

  return ids;
};

export const createExampleInitiatives = async (
  organizationId: string,
  userId: string,
  featureIds: string[],
  productIds: string[]
): Promise<string[]> => {
  const ids = Array.from(
    { length: 5 },
    (_item, index) => `initiative-example-${organizationId}-${index}`
  );

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  for (const id of ids) {
    const transaction = database.initiative.create({
      data: {
        creatorId: userId,
        organizationId,
        title: faker.company.catchPhrase(),
        createdAt: faker.date.recent({ days: 5 }),
        id,
        updatedAt: faker.date.recent({ days: 5 }),
        example: true,
        ownerId: userId,
        emoji: faker.helpers.arrayElement(emojis),
        state: faker.helpers.arrayElement([
          'PLANNED',
          'ACTIVE',
          'COMPLETED',
          'CANCELLED',
        ]),
        products: {
          connect: productIds.map((id) => ({ id })),
        },
        features: {
          connect: featureIds.map((id) => ({ id })),
        },
        team: {
          create: {
            creatorId: userId,
            userId,
            organizationId,
            createdAt: faker.date.recent({ days: 5 }),
            updatedAt: faker.date.recent({ days: 5 }),
          },
        },
        pages: {
          createMany: {
            data: new Array({ length: 5 }).map((_, pageIndex) => ({
              creatorId: userId,
              organizationId,
              createdAt: faker.date.recent({ days: 5 }),
              example: true,
              title: faker.company.catchPhrase(),
              default: pageIndex === 0,
              updatedAt: faker.date.recent({ days: 5 }),
            })),
          },
        },
        canvases: {
          createMany: {
            data: new Array({ length: 5 }).map(() => ({
              creatorId: userId,
              organizationId,
              createdAt: faker.date.recent({ days: 5 }),
              example: true,
              title: faker.company.catchPhrase(),
              content: textToContent(faker.lorem.paragraphs(5)),
              updatedAt: faker.date.recent({ days: 5 }),
            })),
          },
        },
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return ids;
};
