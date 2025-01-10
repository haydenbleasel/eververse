import { getActivity } from '@/actions/activity/get';
import { currentMembers } from '@repo/backend/auth/utils';
import { Prose } from '@repo/design-system/components/prose';
import { createMetadata } from '@repo/seo/metadata';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { ActivityFeed } from './components/activity-feed';

const title = 'Activity';
const description = 'View the latest activity in your organization.';

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Activity = async () => {
  const queryClient = new QueryClient();
  const [members] = await Promise.all([
    currentMembers(),
    queryClient.prefetchInfiniteQuery({
      queryKey: ['activity'],
      queryFn: async ({ pageParam }) => {
        const response = await getActivity(pageParam);

        if ('error' in response) {
          throw response.error;
        }

        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastPage, _allPages, lastPageParameter) =>
        lastPageParameter + 1,
      pages: 1,
    }),
  ]);

  return (
    <Prose className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 py-16">
      <div className="space-y-2">
        <h1 className="m-0 font-semibold text-4xl">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ActivityFeed members={members} />
      </HydrationBoundary>
    </Prose>
  );
};

export default Activity;
