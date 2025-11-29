"use client";

import type { User } from "@repo/backend/auth";
import * as Gantt from "@repo/design-system/components/kibo-ui/gantt";
import { useRouter } from "next/navigation";
import { FeatureItemInner } from "@/components/roadmap-item";

type QuarterlyRoadmapGanttProperties = {
  readonly groups: Record<string, (Gantt.GanttFeature & { ownerId: string })[]>;
  readonly members: User[];
};

export const QuarterlyRoadmapGantt = ({
  groups,
  members,
}: QuarterlyRoadmapGanttProperties) => {
  const router = useRouter();

  const handleSelectItem = (id: string) => router.push(`/features/${id}`);

  return (
    <Gantt.GanttProvider range="quarterly" zoom={100}>
      <Gantt.GanttSidebar>
        {Object.entries(groups).map(([group, features]) => (
          <Gantt.GanttSidebarGroup key={group} name={group}>
            {features.map((feature) => (
              <Gantt.GanttSidebarItem
                feature={feature}
                key={feature.id}
                onSelectItem={handleSelectItem}
              />
            ))}
          </Gantt.GanttSidebarGroup>
        ))}
      </Gantt.GanttSidebar>
      <Gantt.GanttTimeline>
        <Gantt.GanttHeader />
        <Gantt.GanttFeatureList>
          {Object.entries(groups).map(([group, features]) => (
            <Gantt.GanttFeatureListGroup key={group}>
              {features.map((feature) => (
                <Gantt.GanttFeatureItem key={feature.id} {...feature}>
                  <FeatureItemInner
                    feature={feature}
                    owner={members.find(
                      (member) => member.id === feature.ownerId
                    )}
                  />
                </Gantt.GanttFeatureItem>
              ))}
            </Gantt.GanttFeatureListGroup>
          ))}
        </Gantt.GanttFeatureList>
      </Gantt.GanttTimeline>
    </Gantt.GanttProvider>
  );
};
