import { getSlug } from '@/lib/slug';
import { getUserName } from '@repo/backend/auth/format';
import { getMembers } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { Prose } from '@repo/design-system/components/prose';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'The latest updates and changes to Eververse',
};

const Changelog = async () => {
  const slug = await getSlug();

  if (!slug) {
    notFound();
  }

  const portal = await database.portal.findFirst({
    where: { slug },
    select: { organizationId: true },
  });

  if (!portal) {
    notFound();
  }

  const [changelogs, members] = await Promise.all([
    database.changelog.findMany({
      where: {
        organizationId: portal.organizationId,
        status: 'PUBLISHED',
        publishAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        publishAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        publishAt: true,
        tags: {
          select: { name: true },
        },
        creatorId: true,
        content: true,
      },
    }),
    getMembers(portal.organizationId),
  ]);

  const getOwner = (creatorId: string) => {
    const member = members.find(({ id }) => id === creatorId);

    if (!member) {
      return 'Unknown';
    }

    return getUserName(member);
  };

  if (!changelogs.length) {
    return (
      <Prose className="grid w-full max-w-none items-center justify-center gap-2 rounded-2xl border bg-secondary p-12">
        <h1 className="m-0">No changelogs found</h1>
        <p className="m-0">
          There are no changelogs published for this portal.
        </p>
      </Prose>
    );
  }

  const [latest] = changelogs;

  return redirect(`/changelog/${latest.id}`);
};

export default Changelog;
