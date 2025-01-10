import { getUserName } from '@repo/backend/auth/format';
import { getMembers } from '@repo/backend/auth/utils';
import { database, getJsonColumnFromTable } from '@repo/backend/database';
import { contentToMarkdown } from '@repo/editor/lib/tiptap';
import { NextResponse } from 'next/server';

export const GET = async (request: Request): Promise<Response> => {
  const authorization = request.headers.get('Authorization');
  const key = authorization?.split('Bearer ')[1];

  if (!key) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = await database.apiKey.findFirst({
    where: { key },
    select: {
      organization: {
        select: {
          id: true,
          stripeSubscriptionId: true,
        },
      },
    },
  });

  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!apiKey.organization.stripeSubscriptionId) {
    return NextResponse.json(
      {
        error:
          'You need to have a subscription to use the API. Please upgrade your plan.',
      },
      { status: 403 }
    );
  }

  const [changelogs, members] = await Promise.all([
    database.changelog.findMany({
      where: {
        organizationId: apiKey.organization.id,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        publishAt: true,
        slug: true,
        tags: {
          select: { name: true },
        },
        contributors: {
          select: { userId: true },
        },
      },
      orderBy: {
        publishAt: 'desc',
      },
    }),
    getMembers(apiKey.organization.id),
  ]);

  const promises = changelogs.map(async (changelog) => {
    const content = await getJsonColumnFromTable(
      'changelog',
      'content',
      changelog.id
    );
    const markdown = content ? await contentToMarkdown(content) : '';

    return {
      id: changelog.id,
      title: changelog.title,
      description: markdown,
      publishAt: changelog.publishAt,
      slug: changelog.slug,
      tags: changelog.tags.map((tag) => tag.name),
      contributors: changelog.contributors
        .map((contributor) => {
          const member = members.find((user) => user.id === contributor.userId);

          if (!member) {
            return null;
          }

          return getUserName(member);
        })
        .filter(Boolean) as string[],
    };
  });

  const data = await Promise.all(promises);

  return NextResponse.json({ data });
};
