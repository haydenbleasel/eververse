import { Skeleton } from "@repo/design-system/components/precomposed/skeleton";
import { endOfQuarter, startOfQuarter } from "date-fns";
import { Suspense } from "react";
import { database } from "@/lib/database";
import { RoadmapEmptyState } from "./empty-state";
import { QuarterlyRoadmap } from "./quarterly-roadmap";
import { RoadmapTrend } from "./trend";

export const RoadmapSection = async () => {
  const today = new Date();
  const quarterStart = startOfQuarter(today);
  const quarterEnd = endOfQuarter(today);

  const upcomingFeatures = await database.feature.count({
    where: {
      OR: [
        { startAt: { lte: quarterEnd, gte: quarterStart } },
        { endAt: { lte: quarterEnd, gte: quarterStart } },
        { startAt: { lte: quarterStart }, endAt: { gte: quarterEnd } },
      ],
    },
  });

  if (!upcomingFeatures) {
    return (
      <div className="p-16">
        <RoadmapEmptyState />
      </div>
    );
  }

  return (
    <section className="space-y-4 p-4 sm:p-8">
      <div>
        <p className="font-medium text-sm">Roadmap</p>
        <Suspense fallback={<Skeleton className="h-5 w-64" />}>
          <RoadmapTrend />
        </Suspense>
      </div>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <QuarterlyRoadmap />
      </Suspense>
    </section>
  );
};
