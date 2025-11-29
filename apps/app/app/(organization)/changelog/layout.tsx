import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/design-system/components/ui/resizable";
import { createMetadata } from "@repo/seo/metadata";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getChangelog } from "@/actions/changelog/get";
import { Header } from "@/components/header";
import { database } from "@/lib/database";
import { ChangelogEmptyState } from "./components/changelog-empty-state";
import { ChangelogList } from "./components/changelog-list";
import { CreateChangelogButton } from "./components/create-changelog-button";

type ChangelogLayoutProperties = {
  readonly children: ReactNode;
};

const title = "Changelog";
const description = "View the changelog for the organization.";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const ChangelogLayout = async ({ children }: ChangelogLayoutProperties) => {
  const user = await currentUser();
  const queryClient = new QueryClient();

  if (!user) {
    notFound();
  }

  const [count] = await Promise.all([
    database.changelog.count(),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["changelog"],
      queryFn: async ({ pageParam }) => {
        const response = await getChangelog(pageParam);

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

  if (!count) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ChangelogEmptyState role={user.user_metadata.organization_role} />
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" style={{ overflow: "unset" }}>
      <ResizablePanel
        className="sticky top-0 h-screen"
        defaultSize={30}
        maxSize={35}
        minSize={25}
        style={{ overflow: "auto" }}
      >
        <Header badge={count} title="Changelog">
          {user.user_metadata.organization_role ===
          EververseRole.Member ? null : (
            <div className="-m-2">
              <Tooltip align="end" content="Post a new update" side="bottom">
                <CreateChangelogButton />
              </Tooltip>
            </div>
          )}
        </Header>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ChangelogList />
        </HydrationBoundary>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        className="self-start"
        defaultSize={70}
        style={{ overflow: "unset" }}
      >
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChangelogLayout;
