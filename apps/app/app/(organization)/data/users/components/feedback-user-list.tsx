'use client';

import { getFeedbackUsers } from '@/actions/feedback-user/list';
import { ItemList } from '@/components/item-list';
import { Avatar } from '@repo/design-system/components/precomposed/avatar';
import { handleError } from '@repo/design-system/lib/handle-error';
import { formatDate } from '@repo/lib/format';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const FeedbackUsersList = () => {
  const { data, error, fetchNextPage, isFetching, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['feedbackUsers'],
      queryFn: async ({ pageParam }) => {
        const response = await getFeedbackUsers(pageParam);

        if ('error' in response) {
          throw response.error;
        }

        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParameter) =>
        lastPage.length === 0 ? undefined : lastPageParameter + 1,
      getPreviousPageParam: (_firstPage, _allPages, firstPageParameter) =>
        firstPageParameter <= 1 ? undefined : firstPageParameter - 1,
    });

  useEffect(() => {
    if (error) {
      handleError(error.message);
    }
  }, [error]);

  return (
    <ItemList
      data={
        data?.pages.flat().map((item) => ({
          id: item.id,
          href: `/data/users/${item.id}`,
          title: item.name,
          description: item.email,
          caption: formatDate(item.createdAt),
          image: (
            <Avatar src={item.imageUrl} fallback={item.name.slice(0, 2)} />
          ),
        })) ?? []
      }
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
    />
  );
};
