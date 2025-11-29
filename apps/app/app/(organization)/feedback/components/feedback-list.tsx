"use client";

import { Avatar } from "@repo/design-system/components/precomposed/avatar";
import { handleError } from "@repo/design-system/lib/handle-error";
import { formatDate } from "@repo/lib/format";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getFeedback } from "@/actions/feedback/get";
import { ItemList } from "@/components/item-list";
import { useFeedbackOptions } from "@/hooks/use-feedback-options";

export const FeedbackList = () => {
  const { showProcessed } = useFeedbackOptions();
  const { data, error, fetchNextPage, isFetching, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["feedback", showProcessed],
      queryFn: async ({ pageParam }) => {
        const response = await getFeedback(pageParam, showProcessed);

        if ("error" in response) {
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
          href: `/feedback/${item.id}`,
          title: item.title,
          description: item.text,
          caption: formatDate(item.createdAt),
          image: item.feedbackUser?.imageUrl ? (
            <Avatar
              fallback={item.feedbackUser.name.slice(0, 2)}
              src={item.feedbackUser.imageUrl}
            />
          ) : undefined,
        })) ?? []
      }
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
    />
  );
};
