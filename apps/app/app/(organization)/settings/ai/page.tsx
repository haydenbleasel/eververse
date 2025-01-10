import { currentOrganizationId } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { Prose } from '@repo/design-system/components/prose';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AiIndexingChart } from './components/ai-indexing-chart';

export const metadata: Metadata = createMetadata({
  title: 'AI Settings',
  description: 'AI settings for your organization.',
});

const AiSettings = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    notFound();
  }

  const organization = await database.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      productDescription: true,
    },
  });

  if (!organization) {
    notFound();
  }

  return (
    <div className="px-6 py-16">
      <Prose className="mx-auto grid w-full max-w-3xl gap-6">
        <div>
          <h1 className="m-0 font-semibold text-4xl">AI Settings</h1>
          <p className="mt-2 mb-0 text-muted-foreground">
            Manage your organization&apos;s AI settings.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-[391px] h-full" />}>
          <AiIndexingChart />
        </Suspense>
      </Prose>
    </div>
  );
};

export default AiSettings;
