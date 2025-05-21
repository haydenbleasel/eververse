import { getMembers } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import type {
  AtlassianInstallation,
  CannyImport,
  Prisma,
} from '@repo/backend/prisma/client';
import { Canny } from '@repo/canny';
import { textToContent } from '@repo/editor/lib/tiptap';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

const determineConnection = (
  post: Awaited<ReturnType<Canny['post']['list']>>[number],
  atlassianInstallations: {
    id: AtlassianInstallation['id'];
    organizationId: AtlassianInstallation['organizationId'];
  }[]
): Prisma.FeatureCreateInput['connection'] => {
  // clickup.linkedTasks, jira.linkedIssues
  if (
    post.jira.linkedIssues.length === 0 ||
    atlassianInstallations.length === 0
  ) {
    return undefined;
  }

  const [linkedIssue] = post.jira.linkedIssues;
  const [installation] = atlassianInstallations;

  return {
    create: {
      externalId: linkedIssue.id,
      href: linkedIssue.url,
      atlassianInstallationId: installation.id,
      organizationId: installation.organizationId,
    },
  };
};

export const migratePosts = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const posts = await canny.post.list();
  const members = await getMembers(organizationId);

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      features: { select: { cannyId: true, id: true } },
      featureStatuses: { select: { id: true, name: true, fromCanny: true } },
      portals: { select: { id: true } },
      tags: { select: { id: true, cannyId: true } },
      atlassianInstallations: { select: { id: true, organizationId: true } },
      groups: { select: { id: true, cannyId: true } },
      products: { select: { id: true, cannyId: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  if (databaseOrganization.portals.length === 0) {
    throw new Error('Organization does not have a portal');
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const newPosts = posts.filter((post) => {
    const existing = databaseOrganization.features.find(
      ({ cannyId }) => cannyId === post.id
    );

    return !existing;
  });

  for (const post of newPosts) {
    const postTags = new Set(post.tags.map(({ id }) => id));
    const tags = databaseOrganization.tags
      .filter(({ cannyId }) => cannyId && postTags.has(cannyId))
      .map(({ id }) => ({ id }));

    const featureStatus = databaseOrganization.featureStatuses.find(
      ({ fromCanny, name }) => fromCanny && name === post.status
    );

    if (!featureStatus) {
      throw new Error(`Could not find status: ${post.status}`);
    }

    const product = databaseOrganization.products.find(
      ({ cannyId }) => cannyId === post.board.id
    );

    if (!product) {
      throw new Error(`Could not find product: ${post.board.id}`);
    }

    const group = databaseOrganization.groups.find(
      ({ cannyId }) => cannyId === post.category?.id
    );

    if (post.category && !group) {
      throw new Error(`Could not find group: ${post.category.id}`);
    }

    const transaction = database.feature.create({
      data: {
        creatorId:
          members.find(({ email }) => email === post.author?.email)?.id ??
          creatorId,
        organizationId,
        title: post.title,
        cannyId: post.id,
        createdAt: new Date(post.created),
        ownerId:
          members.find(({ email }) => email === post.author?.email)?.id ??
          creatorId,
        statusId: featureStatus.id,
        productId: product.id,
        groupId: group?.id,
        portalFeature: {
          create: {
            creatorId,
            title: post.title,
            cannyId: post.id,
            createdAt: new Date(post.created),
            content: textToContent(post.details),
            organizationId,
            portalId: databaseOrganization.portals[0].id,
          },
        },
        tags: {
          connect: tags,
        },
        content: textToContent(post.details),
        connection: determineConnection(
          post,
          databaseOrganization.atlassianInstallations
        ),
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
