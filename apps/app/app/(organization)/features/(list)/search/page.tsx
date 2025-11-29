import { EververseRole } from "@repo/backend/auth";
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from "@repo/backend/auth/utils";
import type { Prisma } from "@repo/backend/prisma/client";
import { createMetadata } from "@repo/seo/metadata";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getFeatures } from "@/actions/feature/list";
import { FeaturesList } from "@/app/(organization)/features/components/features-list";
import { database } from "@/lib/database";

type FeatureSeachPageProperties = {
  readonly searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export const metadata: Metadata = createMetadata({
  title: "Features",
  description: "Create and manage features for your product.",
});

const FeatureProduct = async (props: FeatureSeachPageProperties) => {
  const searchParams = await props.searchParams;
  const [user, organizationId, members] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
    currentMembers(),
  ]);
  const queryClient = new QueryClient();

  if (!(user && organizationId)) {
    notFound();
  }

  if (typeof searchParams?.query !== "string") {
    redirect("/features");
  }

  const query: Partial<Prisma.FeatureWhereInput> = {
    title: {
      search: searchParams.query,
    },
  };

  const [count, databaseOrganization] = await Promise.all([
    database.feature.count({
      where: query,
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

  if (!databaseOrganization) {
    notFound();
  }

  return (
    <div className="h-full overflow-y-auto">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <FeaturesList
          breadcrumbs={[{ href: "/features", text: "Features" }]}
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
          title={searchParams?.query}
        />
      </HydrationBoundary>
    </div>
  );
};

export default FeatureProduct;
