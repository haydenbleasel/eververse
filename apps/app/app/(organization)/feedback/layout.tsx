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
import { getFeedback } from "@/actions/feedback/get";
import { Header } from "@/components/header";
import { database } from "@/lib/database";
import { CreateFeedbackButton } from "./components/create-feedback-button";
import { FeedbackEmptyState } from "./components/feedback-empty-state";
import { FeedbackList } from "./components/feedback-list";
import { ToggleProcessedButton } from "./components/toggle-processed-button";

type FeedbackLayoutProperties = {
  readonly children: ReactNode;
};

const FeedbackLayout = async ({ children }: FeedbackLayoutProperties) => {
  const queryClient = new QueryClient();
  const [count] = await Promise.all([
    database.feedback.count(),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["feedback", false],
      queryFn: async ({ pageParam }) => {
        const response = await getFeedback(pageParam, false);

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
        <FeedbackEmptyState />
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
        <Header badge={count} title="Feedback">
          <div className="-m-2 flex items-center gap-px">
            <ToggleProcessedButton />
            <CreateFeedbackButton />
          </div>
        </Header>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FeedbackList />
        </HydrationBoundary>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        className="flex min-h-screen flex-col self-start"
        defaultSize={70}
        style={{ overflow: "unset" }}
      >
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default FeedbackLayout;
