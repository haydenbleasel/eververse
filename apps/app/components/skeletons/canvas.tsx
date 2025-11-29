import { Skeleton } from "@repo/design-system/components/precomposed/skeleton";

export const CanvasSkeleton = () => (
  <div className="relative flex flex-1 items-center justify-center">
    <Skeleton className="absolute top-1/4 left-1/4 h-24 w-24 rotate-12 transform rounded-full" />
    <Skeleton className="-rotate-6 absolute right-1/4 bottom-1/4 h-32 w-32 transform rounded-none" />
    <Skeleton className="-rotate-12 absolute bottom-1/3 left-1/3 h-20 w-20 transform rounded-lg" />
    <Skeleton className="absolute top-1/2 left-1/2 h-16 w-16 rotate-90 transform rounded-full" />
  </div>
);
