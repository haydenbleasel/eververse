import { getFeatures } from '@/actions/feature/list';
import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { createMetadata } from '@repo/seo/metadata';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FeaturesEmptyState } from '../components/features-empty-state';
import { FeaturesList } from '../components/features-list';

export const metadata: Metadata = createMetadata({
  title: 'Features',
  description: 'Create and manage features for your product.',
});

const FeaturesIndex = async () => {
  const [user, organizationId, members] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
    currentMembers(),
  ]);

  if (!user || !organizationId) {
    return notFound();
  }

  const queryClient = new QueryClient();
  const query = {};

  const [count, databaseOrganization] = await Promise.all([
    database.feature.count(),
    database.organization.findUnique({
      where: { id: organizationId },
      select: {
        featureStatuses: {
          select: {
            id: true,
            name: true,
            color: true,
            order: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            emoji: true,
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
            emoji: true,
            productId: true,
            parentGroupId: true,
          },
        },
        releases: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: ['features', query],
      queryFn: async ({ pageParam }) => {
        const response = await getFeatures(pageParam, query);

        if ('error' in response) {
          throw response.error;
        }

        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParameter) =>
        lastPage.length === 0 ? undefined : lastPageParameter + 1,
      pages: 1,
    }),
  ]);

  if (!databaseOrganization || !count) {
    return <FeaturesEmptyState role={user.user_metadata.organization_role} />;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeaturesList
        statuses={databaseOrganization.featureStatuses}
        count={count}
        products={databaseOrganization.products}
        groups={databaseOrganization.groups}
        releases={databaseOrganization.releases}
        query={query}
        editable={user.user_metadata.organization_role !== EververseRole.Member}
        members={members}
        role={user.user_metadata.organization_role}
      />
    </HydrationBoundary>
  );
};

export default FeaturesIndex;
