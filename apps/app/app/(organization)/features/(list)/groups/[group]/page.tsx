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

type FeatureGroupPageProperties = {
  readonly params: Promise<{
    readonly group: string;
  }>;
};

export const metadata: Metadata = createMetadata({
  title: 'Features',
  description: 'Create and manage features for your product.',
});

const FeatureGroup = async (props: FeatureGroupPageProperties) => {
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
  const query = { groupId: params.group };

  const [count, databaseOrganization, group] = await Promise.all([
    database.feature.count({
      where: { groupId: params.group },
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
    database.group.findUnique({
      where: { id: params.group },
      select: {
        name: true,
        parentGroupId: true,
        product: {
          select: {
            id: true,
            name: true,
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

  if (!databaseOrganization || !group) {
    notFound();
  }

  const breadcrumbs = [{ href: '/features', text: 'Features' }];

  if (group.product) {
    breadcrumbs.push({
      href: `/features/products/${group.product.id}`,
      text: group.product.name,
    });
  }

  let parent = group.parentGroupId;

  while (parent) {
    const parentGroup = await database.group.findUnique({
      where: { id: parent },
      select: { name: true, parentGroupId: true },
    });

    if (!parentGroup) {
      parent = null;
      break;
    }

    breadcrumbs.push({
      href: `/features/groups/${parent}`,
      text: parentGroup.name,
    });

    parent = parentGroup.parentGroupId;
  }

  return (
    <div className="h-full overflow-y-auto">
      {count ? (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FeaturesList
            title={group.name}
            breadcrumbs={breadcrumbs}
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
          groupId={params.group}
          productId={group.product?.id}
          role={user.user_metadata.organization_role}
        />
      )}
    </div>
  );
};

export default FeatureGroup;
