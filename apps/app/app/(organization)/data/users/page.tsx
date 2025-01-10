import { EmptyState } from '@/components/empty-state';
import { database } from '@/lib/database';
import { createMetadata } from '@repo/seo/metadata';
import { UserCircleIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Users',
  description: 'View all users who have provided feedback.',
});

const UserIndexPage = async () => {
  const feedbackUser = await database.feedbackUser.findFirst({
    orderBy: { name: 'asc' },
    select: { id: true },
  });

  if (!feedbackUser) {
    return (
      <EmptyState
        icon={UserCircleIcon}
        title="No users found"
        description="No users have provided feedback yet."
      />
    );
  }

  return redirect(`/data/users/${feedbackUser.id}`);
};

export default UserIndexPage;
