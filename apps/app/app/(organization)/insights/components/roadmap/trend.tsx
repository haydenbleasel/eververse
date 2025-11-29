import { endOfQuarter, startOfQuarter } from "date-fns";
import { database } from "@/lib/database";

export const RoadmapTrend = async () => {
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

  return (
    <p className="text-muted-foreground text-sm">
      You have {upcomingFeatures} features scheduled for this quarter.
    </p>
  );
};
