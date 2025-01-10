import { getFeatures } from '@/actions/feature/list';
import { FeaturesEmptyState } from '@/app/(organization)/features/components/features-empty-state';
import { FeaturesList } from '@/app/(organization)/features/components/features-list';
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

type FeatureProductPageProperties = {
  readonly params: Promise<{
    readonly product: string;
  }>;
};

export const metadata: Metadata = createMetadata({
  title: 'Features',
  description: 'Create and manage features for your product.',
});

const FeatureProduct = async (props: FeatureProductPageProperties) => {
  const params = await props.params;
  const [user, organizationId, members] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
    currentMembers(),
  ]);

  if (!user || !organizationId) {
    return notFound();
  }

  const queryClient = new QueryClient();
  const query = { productId: params.product };

  const [count, databaseOrganization, product] = await Promise.all([
    database.feature.count({
      where: { productId: params.product },
    }),
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
    database.product.findUnique({
      where: { id: params.product },
      select: { id: true, name: true },
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

  if (!databaseOrganization || !product) {
    notFound();
  }

  return (
    <div className="h-full overflow-y-auto">
      {count ? (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FeaturesList
            title={product.name}
            breadcrumbs={[{ href: '/features', text: 'Features' }]}
            query={query}
            statuses={databaseOrganization.featureStatuses}
            count={count}
            products={databaseOrganization.products}
            groups={databaseOrganization.groups}
            releases={databaseOrganization.releases}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
            members={members}
            role={user.user_metadata.organization_role}
          />
        </HydrationBoundary>
      ) : (
        <FeaturesEmptyState
          productId={product.id}
          role={user.user_metadata.organization_role}
        />
      )}
    </div>
  );
};

export default FeatureProduct;
