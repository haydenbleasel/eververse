'use client';

import { updateFeature } from '@/actions/feature/update';
import { deleteMarker } from '@/actions/roadmap-event/delete';
import { FeatureItemInner } from '@/components/roadmap-item';
import { StatusLegend } from '@/components/status-legend';
import { useRoadmap } from '@/hooks/use-roadmap';
import type {
  Feature,
  FeatureStatus,
  Group,
  Initiative,
  Product,
  Release,
  RoadmapEvent,
} from '@prisma/client';
import type { User } from '@repo/backend/auth';
import { Select } from '@repo/design-system/components/precomposed/select';
import * as Gantt from '@repo/design-system/components/roadmap-ui/gantt';
import { Stepper } from '@repo/design-system/components/stepper';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@repo/design-system/components/ui/context-menu';
import { useCopyToClipboard } from '@repo/design-system/hooks/use-copy-to-clipboard';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { createFuse } from '@repo/lib/fuse';
import { EyeIcon, LinkIcon, TrashIcon } from 'lucide-react';
import { parseAsString, useQueryState } from 'next-usequerystate';
import { useMemo, useState } from 'react';
import { RoadmapAddFeature } from './roadmap-add-feature';
import { RoadmapMarkerDialog } from './roadmap-marker-dialog';
import { RoadmapPeek } from './roadmap-peek';
import { RoadmapSearch } from './roadmap-search';

const ranges: {
  label: string;
  value: string;
}[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
];

const groupings = [
  { label: 'Feature', value: 'feature' },
  { label: 'Product', value: 'product' },
  { label: 'Group', value: 'group' },
  { label: 'Owner', value: 'owner' },
  { label: 'Release', value: 'release' },
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

export type RoadmapEditorProperties = {
  readonly allFeatures: (Pick<Feature, 'id' | 'title'> & {
    readonly status: Pick<FeatureStatus, 'color'>;
  })[];
  readonly features: (Pick<
    Feature,
    'id' | 'ownerId' | 'title' | 'endAt' | 'content'
  > & {
    readonly startAt: Date;
    readonly status: Pick<
      FeatureStatus,
      'color' | 'complete' | 'id' | 'name' | 'order'
    >;
    readonly group: Pick<Group, 'id' | 'name'> | null;
    readonly product: Pick<Product, 'id' | 'name'> | null;
    readonly release: Pick<Release, 'id' | 'title'> | null;
    readonly initiatives: Pick<Initiative, 'id' | 'title'>[];
  })[];
  readonly markers: Pick<RoadmapEvent, 'date' | 'id' | 'text'>[];
  readonly editable: boolean;
  readonly subscribed: boolean;
  readonly members: User[];
};

export const RoadmapEditor = ({
  features,
  allFeatures,
  markers,
  editable,
  subscribed,
  members,
}: RoadmapEditorProperties) => {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault('')
  );
  const featuresFuse = createFuse(features, ['title', 'text']);
  const searchResults = featuresFuse.search(search);
  const roadmap = useRoadmap();
  const statuses: RoadmapEditorProperties['features'][number]['status'][] = [];
  const [newFeatureDate, setNewFeatureDate] = useState<Date | undefined>(
    undefined
  );
  const [newMarkerDate, setNewMarkerDate] = useState<Date | undefined>(
    undefined
  );
  const { copyToClipboard } = useCopyToClipboard();

  const groups = useMemo(() => {
    const data = search ? searchResults.map(({ item }) => item) : features;
    const groupedData: Record<string, Gantt.GanttFeature[]> = {};

    // Filter data based on the filter state
    let filteredData = data;
    if (roadmap.filter === 'incomplete') {
      filteredData = data.filter((feature) => !feature.status.complete);
    } else if (roadmap.filter === 'complete') {
      filteredData = data.filter((feature) => feature.status.complete);
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
  }, [features, roadmap.filter, roadmap.grouping, search, searchResults]);

  for (const feature of features) {
    if (!statuses.some((status) => status.id === feature.status.id)) {
      statuses.push(feature.status);
    }
  }

  const handleMoveFeature = async (
    id: string,
    startAt: Date,
    endAt: Date | null
  ) => {
    try {
      const response = await updateFeature(id, { startAt, endAt });

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    try {
      const response = await updateFeature(featureId, {
        startAt: null,
        endAt: null,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Successfully removed feature from roadmap');
    } catch (error) {
      handleError(error);
    }
  };

  const handleRemoveMarker = async (markerId: string) => {
    try {
      const response = await deleteMarker(markerId);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Successfully removed marker from roadmap');
    } catch (error) {
      handleError(error);
    }
  };

  const handleViewFeature = (id: string) =>
    setTimeout(() => roadmap.setPeekId(id), 200);

  const handleCopyLink = (id: string) =>
    copyToClipboard(`${window.location.origin}/features/${id}`);

  const peekFeature = features.find((feature) => feature.id === roadmap.peekId);

  const getOwnerId = (featureId: string) =>
    features.find((feature) => feature.id === featureId)?.ownerId;

  return (
    <>
      <div className="flex h-[calc(100vh-57px)] flex-col overflow-clip pb-[45px]">
        <Gantt.GanttProvider
          onAddItem={editable ? setNewFeatureDate : undefined}
          range={roadmap.range}
          zoom={roadmap.zoom}
        >
          <Gantt.GanttSidebar>
            {Object.entries(groups).map(([group, features]) => (
              <Gantt.GanttSidebarGroup key={group} name={group}>
                {features.map((feature) => (
                  <Gantt.GanttSidebarItem
                    key={feature.id}
                    feature={feature}
                    onSelectItem={handleViewFeature}
                  />
                ))}
              </Gantt.GanttSidebarGroup>
            ))}
          </Gantt.GanttSidebar>
          <Gantt.GanttTimeline>
            <Gantt.GanttHeader />
            <Gantt.GanttFeatureList>
              {Object.entries(groups).map(([group, groupFeatures]) => (
                <Gantt.GanttFeatureListGroup key={group}>
                  {groupFeatures.map((feature) => (
                    <div key={feature.id} className="flex">
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleViewFeature(feature.id)}
                          >
                            <Gantt.GanttFeatureItem
                              {...feature}
                              onMove={editable ? handleMoveFeature : undefined}
                            >
                              <FeatureItemInner
                                feature={feature}
                                owner={members.find(
                                  (member) =>
                                    member.id === getOwnerId(feature.id)
                                )}
                              />
                            </Gantt.GanttFeatureItem>
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleViewFeature(feature.id)}
                          >
                            <EyeIcon
                              size={16}
                              className="text-muted-foreground"
                            />
                            View feature
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleCopyLink(feature.id)}
                          >
                            <LinkIcon
                              size={16}
                              className="text-muted-foreground"
                            />
                            Copy link
                          </ContextMenuItem>
                          {editable && (
                            <ContextMenuItem
                              className="flex items-center gap-2 text-destructive"
                              onClick={() => handleRemoveFeature(feature.id)}
                            >
                              <TrashIcon size={16} />
                              Remove from roadmap
                            </ContextMenuItem>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  ))}
                </Gantt.GanttFeatureListGroup>
              ))}
            </Gantt.GanttFeatureList>
            {markers.map((marker) => (
              <Gantt.GanttMarker
                key={marker.id}
                onRemove={handleRemoveMarker}
                id={marker.id}
                date={marker.date}
                label={marker.text}
                className="bg-success text-white"
              />
            ))}
            <Gantt.GanttToday className="bg-primary text-white" />
            <Gantt.GanttCreateMarkerTrigger onCreateMarker={setNewMarkerDate} />
          </Gantt.GanttTimeline>
        </Gantt.GanttProvider>
        <div className="sticky bottom-0 z-50 flex items-center justify-between gap-3 border-t bg-backdrop/90 p-1 backdrop-blur-sm">
          <RoadmapSearch value={search} onChange={setSearch} />
          <div className="flex grow-1 items-center justify-items-end gap-2">
            <div>
              <Select
                value={roadmap.grouping}
                onChange={(value) => roadmap.setGrouping(value as never)}
                data={groupings}
              />
            </div>
            <div>
              <Select
                value={roadmap.range}
                onChange={(value) => roadmap.setRange(value as never)}
                data={ranges}
              />
            </div>
            <div>
              <Select
                value={roadmap.filter}
                onChange={(value) => roadmap.setFilter(value as never)}
                data={filters}
              />
            </div>
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
            <StatusLegend statuses={statuses} />
          </div>
        </div>
      </div>
      <RoadmapPeek
        open={Boolean(peekFeature)}
        onOpenChange={() => roadmap.setPeekId(null)}
        feature={peekFeature}
        owner={
          peekFeature
            ? members.find((member) => member.id === peekFeature.ownerId)
            : undefined
        }
        editable={editable}
        subscribed={subscribed}
      />
      <RoadmapAddFeature
        features={allFeatures}
        open={Boolean(newFeatureDate)}
        defaultValue={newFeatureDate}
        setOpen={(isOpen: boolean) => {
          if (!isOpen) {
            setNewFeatureDate(undefined);
          }
        }}
      />
      <RoadmapMarkerDialog
        open={Boolean(newMarkerDate)}
        setOpen={() => setNewMarkerDate(undefined)}
        date={newMarkerDate}
      />
    </>
  );
};
