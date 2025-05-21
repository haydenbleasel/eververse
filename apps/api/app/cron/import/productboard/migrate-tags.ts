import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { slugify } from '@repo/lib/slugify';
import { createClient } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateTags = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });
  const notes = await productboard.GET('/notes', {
    params: {
      header: {
        'X-Version': 1,
      },
    },
  });

  if (notes.error) {
    throw new Error(notes.error.errors?.source?.join(', ') ?? 'Unknown error');
  }

  if (!notes.data) {
    throw new Error('No notes found');
  }

  const existingTags = await database.tag.findMany({
    where: { organizationId },
    select: { name: true, slug: true },
  });

  const tags = new Set<string>();

  for (const note of notes.data.data) {
    const noteTags = note.tags?.split(',');

    if (!noteTags) {
      continue;
    }

    for (const tag of noteTags) {
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
