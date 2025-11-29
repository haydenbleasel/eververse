"use client";

import type { User } from "@repo/backend/auth";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getActivity } from "@/actions/activity/get";
import { InfiniteLoader } from "@/components/infinite-loader";
import { ActivityDay } from "./activity-day";

type ActivityFeedProperties = {
  readonly members: User[];
};

export const ActivityFeed = ({ members }: ActivityFeedProperties) => {
  const { data, error, fetchNextPage, isFetching, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["activity"],
      queryFn: async ({ pageParam }) => {
        const response = await getActivity(pageParam);

        if ("error" in response) {
          throw response.error;
        }

        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastPage, _allPages, lastPageParameter) =>
        lastPageParameter + 1,
      getPreviousPageParam: (_firstPage, _allPages, firstPageParameter) =>
        firstPageParameter <= 1 ? undefined : firstPageParameter - 1,
    });

  useEffect(() => {
    if (error) {
      handleError(error.message);
    }
  }, [error]);

  return (
    <>
      {data?.pages.map((activity, index) => (
        <ActivityDay data={activity} key={index} members={members} />
      ))}
      {hasNextPage ? (
        <InfiniteLoader loading={isFetching} onView={fetchNextPage} />
      ) : null}
    </>
  );
};
