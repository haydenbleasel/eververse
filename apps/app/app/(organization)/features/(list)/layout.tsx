import { EververseRole } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from "@repo/backend/auth/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/design-system/components/ui/resizable";
import { formatDate } from "@repo/lib/format";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { database } from "@/lib/database";
import { FeatureCreateDropdown } from "../components/feature-create-dropdown";
import { FeaturesDragProvider } from "../components/features-drag-provider";
import { ProductsList } from "../components/products-list";

type FeatureListLayoutProperties = {
  readonly children: ReactNode;
};

const FeatureListLayout = async ({ children }: FeatureListLayoutProperties) => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    notFound();
  }

  const [databaseOrganization, members] = await Promise.all([
    database.organization.findUnique({
      where: { id: organizationId },
      select: {
        products: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            emoji: true,
            groups: {
              select: {
                id: true,
                name: true,
                emoji: true,
                parentGroupId: true,
              },
            },
          },
        },
        features: {
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
            ownerId: true,
            createdAt: true,
          },
        },
      },
    }),
    currentMembers(),
  ]);

  if (!databaseOrganization) {
    notFound();
  }

  const promises = databaseOrganization.features.map(async (properties) => {
    const owner = properties.ownerId
      ? members.find(({ id }) => id === properties.ownerId)
      : null;
    return {
      ...properties,
      text: `Created ${formatDate(properties.createdAt)}`,
      owner: owner
        ? {
            name: getUserName(owner),
            email: owner.email,
            imageUrl: owner.user_metadata.image_url,
          }
        : null,
    };
  });

  const modifiedFeatures = await Promise.all(promises);

  return (
    <FeaturesDragProvider
      features={modifiedFeatures}
      products={databaseOrganization.products}
    >
      <ResizablePanelGroup direction="horizontal" style={{ overflow: "unset" }}>
        <ResizablePanel
          className="sticky top-0 h-screen"
          defaultSize={20}
          maxSize={25}
          minSize={15}
          style={{ overflow: "auto" }}
        >
          <Header badge={databaseOrganization.products.length} title="Products">
            {user.user_metadata.organization_role ===
            EververseRole.Member ? null : (
              <FeatureCreateDropdown
                hasProducts={databaseOrganization.products.length > 0}
              />
            )}
          </Header>
          <ProductsList
            products={databaseOrganization.products}
            role={user.user_metadata.organization_role}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80} style={{ overflow: "unset" }}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </FeaturesDragProvider>
  );
};

export default FeatureListLayout;
