import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { slugify } from '@repo/lib/slugify';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateTags = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const notes = await productboard.note.list();

  const existingTags = await database.tag.findMany({
    where: { organizationId },
    select: { name: true, slug: true },
  });

  const tags = new Set<string>();

  for (const note of notes) {
    for (const tag of note.tags) {
      tags.add(tag);
    }
  }

  const data: Prisma.TagCreateManyInput[] = [...tags]
    .filter((tag) => {
      const existing = existingTags.find(
        ({ name, slug }) =>
          name.toLowerCase() === tag.toLowerCase() ||
          slug.toLowerCase() === tag.toLowerCase()
      );

      return !existing;
    })
    .map((tag) => ({
      name: tag,
      slug: slugify(tag),
      organizationId,
      creatorId,
    }));

  await database.tag.createMany({
    data,
    skipDuplicates: true,
  });

  return data.length;
};
