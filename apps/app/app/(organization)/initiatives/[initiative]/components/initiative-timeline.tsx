'use client';

import { FeatureItemInner } from '@/components/roadmap-item';
import { useRoadmap } from '@/hooks/use-roadmap';
import type { User } from '@repo/backend/auth';
import type {
  Feature,
  FeatureStatus,
  Group,
  Initiative,
  Product,
  Release,
} from '@repo/backend/prisma/client';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Select } from '@repo/design-system/components/precomposed/select';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Stepper } from '@repo/design-system/components/stepper';
import { Button } from '@repo/design-system/components/ui/button';
import * as Gantt from '@repo/design-system/components/ui/kibo-ui/gantt';
import { GanttChartIcon, Maximize2Icon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

type InitiativeTimelineProps = {
  title: Initiative['title'];
  features: (Pick<Feature, 'id' | 'title' | 'ownerId'> & {
    status: Pick<FeatureStatus, 'id' | 'color' | 'name' | 'complete'>;
    group: Pick<Group, 'id' | 'name'> | null;
    product: Pick<Product, 'id' | 'name'> | null;
    release: Pick<Release, 'id' | 'title'> | null;
    startAt: Date;
    endAt: Date;
  })[];
  readonly members: User[];
};

const groupings = [
  { label: 'Feature', value: 'feature' },
  { label: 'Product', value: 'product' },
  { label: 'Group', value: 'group' },
  { label: 'Owner', value: 'owner' },
  { label: 'Release', value: 'release' },
];

const ranges: {
  label: string;
  value: string;
}[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
];

const filters = [
  {
    label: 'Incomplete',
    value: 'incomplete',
  },
  {
    label: 'Complete',
    value: 'complete',
  },
  {
    label: 'All Features',
    value: 'all',
  },
];

export const InitiativeTimeline = ({
  title,
  features,
  members,
}: InitiativeTimelineProps) => {
  const roadmap = useRoadmap();
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const groups = useMemo(() => {
    const groupedData: Record<string, Gantt.GanttFeature[]> = {};

    // Filter data based on the filter state
    let filteredData = features;
    if (roadmap.filter === 'incomplete') {
      filteredData = features.filter((feature) => !feature.status.complete);
    } else if (roadmap.filter === 'complete') {
      filteredData = features.filter((feature) => feature.status.complete);
    }

    // Group data based on the grouping state
    for (const feature of filteredData) {
      let groupKey = '';
      switch (roadmap.grouping) {
        case 'group':
          groupKey = feature.group?.name ?? 'Ungrouped';
          break;
        case 'product':
          groupKey = feature.product?.name ?? 'No Product';
          break;
        case 'release':
          groupKey = feature.release?.title ?? 'No Release';
          break;
        default:
          groupKey = 'All Features';
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }
      groupedData[groupKey].push({
        id: feature.id,
        name: feature.title,
        startAt: feature.startAt,
        endAt: feature.endAt ?? new Date(),
        status: feature.status,
      });
    }

    // Sort groups
    return Object.fromEntries(
      Object.entries(groupedData).sort(([nameA], [nameB]) =>
        nameA.localeCompare(nameB)
      )
    );
  }, [features, roadmap.filter, roadmap.grouping]);

  const Roadmap = useCallback(() => {
    const getOwnerId = (featureId: string) =>
      features.find((feature) => feature.id === featureId)?.ownerId;

    return (
      <Gantt.GanttProvider range={roadmap.range} zoom={roadmap.zoom}>
        <Gantt.GanttSidebar>
          {Object.entries(groups).map(([group, features]) => (
            <Gantt.GanttSidebarGroup key={group} name={group}>
              {features.map((feature) => (
                <Gantt.GanttSidebarItem
                  key={feature.id}
                  feature={feature}
                  onSelectItem={() => {
                    window.open(
                      `${window.location.origin}/features/${feature.id}`,
                      '_blank'
                    );
                  }}
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
                        (member) => member.id === getOwnerId(feature.id)
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
  }, [features, groups, roadmap.range, roadmap.zoom]);

  return (
    <>
      <StackCard
        title="Roadmap"
        icon={GanttChartIcon}
        className="max-h-[30rem] w-full overflow-auto p-0"
        action={
          <div className="-m-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setRoadmapModalOpen(true)}
            >
              <Maximize2Icon size={16} className="text-muted-foreground" />
            </Button>
          </div>
        }
      >
        <Roadmap />
      </StackCard>

      <Dialog
        open={roadmapModalOpen}
        onOpenChange={setRoadmapModalOpen}
        className="flex h-full max-h-[90vh] max-w-[90vw] flex-col gap-0 divide-y overflow-hidden p-0"
      >
        <div className="shrink-0 grow-0 p-4 font-medium text-sm">
          {title} Roadmap
        </div>
        <div className="flex flex-1 overflow-hidden">
          <Roadmap />
        </div>
        <div className="flex shrink-0 grow-0 items-center justify-end gap-px p-2">
          <div className="w-36">
            <Stepper
              value={roadmap.zoom}
              min={50}
              max={200}
              step={10}
              onChange={(value) => roadmap.setZoom(value)}
              suffix="%"
            />
          </div>
          <div>
            <Select
              value={roadmap.filter}
              onChange={(value) => roadmap.setFilter(value as never)}
              data={filters}
              className="border-none shadow-none"
            />
          </div>
          <div>
            <Select
              data={groupings}
              value={roadmap.grouping}
              onChange={(value) => roadmap.setGrouping(value as never)}
              type="grouping"
              className="border-none shadow-none"
            />
          </div>
          <div>
            <Select
              data={ranges}
              value={roadmap.range}
              onChange={(value) => roadmap.setRange(value as never)}
              type="range"
              className="border-none shadow-none"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
