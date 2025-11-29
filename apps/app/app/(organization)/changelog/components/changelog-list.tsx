"use client";
import { toast } from "@repo/design-system/lib/toast";
import { cn } from "@repo/design-system/lib/utils";
import { formatDate } from "@repo/lib/format";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getChangelog } from "@/actions/changelog/get";
import { ItemList } from "@/components/item-list";

export const ChangelogList = () => {
  const { data, error, fetchNextPage, isFetching, hasNextPage } =
    useInfiniteQuery({
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
      getPreviousPageParam: (_firstPage, _allPages, firstPageParameter) =>
        firstPageParameter <= 1 ? undefined : firstPageParameter - 1,
    });

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return (
    <ItemList
      data={
        data?.pages.flat().map((item) => ({
          id: item.id,
          href: `/changelog/${item.id}`,
          title: (
            <span className="flex items-center gap-2">
              <span>{item.title}</span>
              <span
                className={cn(
                  "aspect-square w-1.5 shrink-0 rounded-full",
                  item.status === "PUBLISHED" ? "bg-success" : "bg-card"
                )}
              />
            </span>
          ),
          description: item.text,
          caption: formatDate(item.publishAt),
        })) ?? []
      }
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
    />
  );
};
