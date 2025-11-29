import { currentMembers } from "@repo/backend/auth/utils";
import { StackCard } from "@repo/design-system/components/stack-card";
import type { GanttFeature } from "@repo/design-system/components/kibo-ui/gantt";
import { endOfQuarter, startOfQuarter } from "date-fns";
import { database } from "@/lib/database";
import { QuarterlyRoadmapGantt } from "./gantt";

export const QuarterlyRoadmap = async () => {
  const today = new Date();
  const quarterStart = startOfQuarter(today);
  const quarterEnd = endOfQuarter(today);
  const members = await currentMembers();
  const features = await database.feature.findMany({
    where: {
      OR: [
        { startAt: { lte: quarterEnd, gte: quarterStart } },
        { endAt: { lte: quarterEnd, gte: quarterStart } },
        { startAt: { lte: quarterStart }, endAt: { gte: quarterEnd } },
      ],
    },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      ownerId: true,
      group: {
        select: {
          id: true,
          name: true,
        },
      },
      release: {
        select: {
          id: true,
          title: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      status: {
        select: {
          id: true,
          color: true,
          name: true,
        },
      },
    },
  });

  const createGroupedFeatures = () => {
    const groupedData: Record<string, (GanttFeature & { ownerId: string })[]> =
      {};

    for (const feature of features) {
      const groupKey = feature.product?.name ?? "No Product";

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }
      groupedData[groupKey].push({
        id: feature.id,
        name: feature.title,
        startAt: feature.startAt ?? quarterStart,
        endAt: feature.endAt ?? quarterEnd,
        status: {
          color: feature.status?.color,
          name: feature.status?.name,
          id: feature.status?.id,
        },
        ownerId: feature.ownerId,
      });
    }

    // Sort groups alphabetically
    return Object.fromEntries(
      Object.entries(groupedData).sort(([nameA], [nameB]) =>
        nameA.localeCompare(nameB)
      )
    );
  };

  const groups = createGroupedFeatures();

  return (
    <StackCard className="p-0" title="Quarterly Roadmap">
      <QuarterlyRoadmapGantt groups={groups} members={members} />
    </StackCard>
  );
};
