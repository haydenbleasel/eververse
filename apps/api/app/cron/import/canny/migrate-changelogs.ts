import type { CannyImport, Prisma } from '@prisma/client';
import { database } from '@repo/backend/database';
import { Canny } from '@repo/canny';
import { htmlToContent, markdownToHtml } from '@repo/editor/lib/tiptap';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateChangelogs = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const changelogs = await canny.changelog.list();

  const existingChangelogs = await database.changelog.findMany({
    where: { organizationId },
    select: { cannyId: true },
  });

  let changelogTags = await database.changelogTag.findMany({
    where: { organizationId, fromCanny: true },
    select: { id: true, name: true },
  });

  if (changelogTags.length === 0) {
    await database.changelogTag.createMany({
      data: ['new', 'fixed', 'improved'].map((tag) => {
        const properties: Prisma.ChangelogTagCreateManyInput = {
          name: tag,
          organizationId,
          fromCanny: true,
        };

        return properties;
      }),
      skipDuplicates: true,
    });

    changelogTags = await database.changelogTag.findMany({
      where: { organizationId, fromCanny: true },
      select: { id: true, name: true },
    });
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  const promises = changelogs
    .filter((changelog) => {
      const existing = existingChangelogs.find(
        ({ cannyId }) => cannyId === changelog.id
      );

      return !existing;
    })
    .map(async (changelog) => {
      const html = await markdownToHtml(changelog.markdownDetails);

      const transaction = database.changelog.create({
        data: {
          creatorId,
          organizationId,
          title: changelog.title,
          cannyId: changelog.id,
          createdAt: new Date(changelog.created),
          publishAt: new Date(changelog.publishedAt),
          status: changelog.status === 'published' ? 'PUBLISHED' : 'DRAFT',
          tags: {
            connect: changelog.types.map((type) => ({
              id: changelogTags.find(({ name }) => name === type)?.id,
            })),
          },
          content: htmlToContent(html),
        },
      });

      transactions.push(transaction);
    });

  await Promise.all(promises);
  await database.$transaction(transactions);

  return transactions.length;
};
