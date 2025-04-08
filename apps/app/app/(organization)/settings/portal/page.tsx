import { EmptyState } from '@/components/empty-state';
import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { Prose } from '@repo/design-system/components/prose';
import { createMetadata } from '@repo/seo/metadata';
import { AppWindowIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CreatePortalButton } from './components/create-portal-button';
import { PortalFeaturesCard } from './components/portal-features-card';
import { PortalStatusesCard } from './components/portal-statuses-card';
import { PortalUrlCard } from './components/portal-url-card';

export const metadata: Metadata = createMetadata({
  title: 'Portal',
  description: 'Manage your portal',
});

const Portal = async () => {
  const user = await currentUser();

  if (!user) {
    return notFound();
  }

  const portalCount = await database.portal.count();

  if (!portalCount) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="Create your portal"
          description="A portal is a place where you can share your changelog and upcoming features with your users."
          icon={AppWindowIcon}
        >
          {user.user_metadata.organization_role === EververseRole.Admin ? (
            <CreatePortalButton />
          ) : (
            <p className="font-medium text-sm">
              Ask your admin to create a portal for you!
            </p>
          )}
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="px-6 py-16">
      <Prose className="mx-auto grid w-full max-w-3xl gap-6">
        <div>
          <h1 className="m-0 font-semibold text-4xl">Portal</h1>
          <p className="mt-2 mb-0 text-muted-foreground">
            Manage your portal settings.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-[99px] w-full" />}>
          <PortalUrlCard />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[375px] w-full" />}>
          <PortalFeaturesCard />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <PortalStatusesCard />
        </Suspense>
      </Prose>
    </div>
  );
};

export default Portal;
