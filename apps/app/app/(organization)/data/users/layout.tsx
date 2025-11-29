import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/design-system/components/ui/resizable";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getFeedbackUsers } from "@/actions/feedback-user/list";
import { database } from "@/lib/database";
import { FeedbackUsersList } from "./components/feedback-user-list";

type UsersDataLayoutProperties = {
  readonly children: ReactNode;
};

const UsersDataLayout = async ({ children }: UsersDataLayoutProperties) => {
  const queryClient = new QueryClient();
  const [count] = await Promise.all([
    database.feedbackUser.count(),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["feedbackUsers"],
      queryFn: async ({ pageParam }) => {
        const response = await getFeedbackUsers(pageParam);

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
    return <div />;
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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FeedbackUsersList />
        </HydrationBoundary>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70} style={{ overflow: "unset" }}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default UsersDataLayout;
