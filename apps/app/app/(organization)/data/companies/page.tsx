import { EmptyState } from '@/components/empty-state';
import { database } from '@/lib/database';
import { createMetadata } from '@repo/seo/metadata';
import { BuildingIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Companies',
  description: 'View all companies who have provided feedback.',
});

const CompanyIndexPage = async () => {
  const feedbackOrganization = await database.feedbackOrganization.findFirst({
    orderBy: { name: 'asc' },
    select: { id: true },
  });

  if (!feedbackOrganization) {
    return (
      <EmptyState
        icon={BuildingIcon}
        title="No companies found"
        description="No companies have provided feedback yet."
      />
    );
  }

  return redirect(`/data/companies/${feedbackOrganization.id}`);
};

export default CompanyIndexPage;
