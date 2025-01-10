import { FeaturesEmptyState } from '@/app/(organization)/features/components/features-empty-state';
import { database } from '@/lib/database';
import { currentUser } from '@repo/backend/auth/utils';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AssignedFeatures } from './assigned-features';
import { OwnersChart } from './owners-chart';
import { StatusesChart } from './statuses-chart';
import { FeaturesTrend } from './trend';

export const FeaturesSection = async () => {
  const [user, featuresCount] = await Promise.all([
    currentUser(),
    database.feature.count(),
  ]);

  if (!user) {
    notFound();
  }

  if (!featuresCount) {
    return (
      <div className="p-16">
        <FeaturesEmptyState role={user.user_metadata.organization_role} />
      </div>
    );
  }

  return (
    <section className="space-y-4 p-4 sm:p-8">
      <div>
        <p className="font-medium text-sm">Features</p>
        <Suspense fallback={<Skeleton className="h-5 w-64" />}>
          <FeaturesTrend />
        </Suspense>
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[431px] w-full" />}>
          <StatusesChart />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[431px] w-full" />}>
          <OwnersChart />
        </Suspense>
        <div className="sm:col-span-2">
          <Suspense fallback={<Skeleton className="h-[433px] w-full" />}>
            <AssignedFeatures />
          </Suspense>
        </div>
      </div>
    </section>
  );
};
