import { EververseRole } from "@repo/backend/auth";
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from "@repo/backend/auth/utils";
import { createMetadata } from "@repo/seo/metadata";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeatures } from "@/actions/feature/list";
import { FeaturesEmptyState } from "@/app/(organization)/features/components/features-empty-state";
import { FeaturesList } from "@/app/(organization)/features/components/features-list";
import { database } from "@/lib/database";

type FeatureGroupPageProperties = {
  readonly params: Promise<{
    readonly group: string;
  }>;
};

export const metadata: Metadata = createMetadata({
  title: "Features",
  description: "Create and manage features for your product.",
});

const FeatureGroup = async (props: FeatureGroupPageProperties) => {
  const params = await props.params;
  const [user, organizationId, members] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
    currentMembers(),
  ]);

  if (!(user && organizationId)) {
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
      queryKey: ["features", query],
      queryFn: async ({ pageParam }) => {
        const response = await getFeatures(pageParam, query);

        if ("error" in response) {
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

  if (!(databaseOrganization && group)) {
    notFound();
  }

  const breadcrumbs = [{ href: "/features", text: "Features" }];

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
            breadcrumbs={breadcrumbs}
            count={count}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
            groups={databaseOrganization.groups}
            members={members}
            products={databaseOrganization.products}
            query={query}
            releases={databaseOrganization.releases}
            role={user.user_metadata.organization_role}
            statuses={databaseOrganization.featureStatuses}
            title={group.name}
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
