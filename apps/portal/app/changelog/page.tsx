import { getSlug } from '@/lib/slug';
import { getUserName } from '@repo/backend/auth/format';
import { getMembers } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UpdateItem } from './components/update-item';

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

  return (
    <div className="grid divide-y">
      {changelogs.map((update, index) => (
        <UpdateItem
          key={update.id}
          update={update}
          index={index}
          owner={getOwner(update.creatorId)}
        />
      ))}
    </div>
  );
};

export default Changelog;
