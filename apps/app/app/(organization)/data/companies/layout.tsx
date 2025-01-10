import { getFeedbackCompanies } from '@/actions/feedback-organization/list';
import { database } from '@/lib/database';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@repo/design-system/components/ui/resizable';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { FeedbackCompanyList } from './components/feedback-company-list';

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
      queryKey: ['feedbackCompanies'],
      queryFn: async ({ pageParam }) => {
        const response = await getFeedbackCompanies(pageParam);

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

  if (!count) {
    return <div />;
  }

  return (
    <ResizablePanelGroup direction="horizontal" style={{ overflow: 'unset' }}>
      <ResizablePanel
        minSize={25}
        defaultSize={30}
        maxSize={35}
        style={{ overflow: 'auto' }}
        className="sticky top-0 h-screen"
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FeedbackCompanyList />
        </HydrationBoundary>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70} style={{ overflow: 'unset' }}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default CompaniesDataLayout;
