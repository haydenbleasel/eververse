import { database } from '@/lib/database';
import { redirect } from 'next/navigation';

const Changelog = async () => {
  const changelogs = await database.changelog.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return redirect(`/changelog/${changelogs.at(0)?.id}`);
};

export default Changelog;
