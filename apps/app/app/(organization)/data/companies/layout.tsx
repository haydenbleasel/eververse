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
import { getFeedbackCompanies } from "@/actions/feedback-organization/list";
import { database } from "@/lib/database";
import { FeedbackCompanyList } from "./components/feedback-company-list";

type CompaniesDataLayoutProperties = {
  readonly children: ReactNode;
};

const CompaniesDataLayout = async ({
  children,
}: CompaniesDataLayoutProperties) => {
  const queryClient = new QueryClient();

  const [count] = await Promise.all([
    database.feedbackOrganization.count(),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["feedbackCompanies"],
      queryFn: async ({ pageParam }) => {
        const response = await getFeedbackCompanies(pageParam);

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
          <FeedbackCompanyList />
        </HydrationBoundary>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70} style={{ overflow: "unset" }}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default CompaniesDataLayout;
