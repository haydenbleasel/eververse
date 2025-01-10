'use client';

import { updatePortalStatusMapping } from '@/actions/portal-status-mapping/update';
import { DndContext, rectIntersection } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type {
  FeatureStatus,
  PortalStatus,
  PortalStatusMapping,
} from '@prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { tailwind } from '@repo/tailwind-config';
import { useState } from 'react';
import { FeatureStatusColumn } from './feature-status-column';

type StatusMappingsFormProperties = {
  readonly defaultColumns: (Pick<
    PortalStatus,
    'color' | 'id' | 'name' | 'order'
  > & {
    readonly portalStatusMappings: (Pick<PortalStatusMapping, 'id'> & {
      readonly featureStatus: Pick<FeatureStatus, 'color' | 'id' | 'name'>;
    })[];
  })[];
  readonly statuses: Pick<FeatureStatus, 'color' | 'id' | 'name'>[];
  readonly disabled: boolean;
};

export const StatusMappingsForm = ({
  defaultColumns,
  statuses,
  disabled,
}: StatusMappingsFormProperties) => {
  const [columns, setColumns] = useState(defaultColumns);

  const handleDragEnd = async (event: DragEndEvent) => {
    const container = event.over?.id;
    const { id } = event.active;
    const oldColumns = [...columns];

    if (!container || disabled) {
      return;
    }

    setColumns(() =>
      oldColumns.map((column) => {
        if (column.id === container) {
          return {
            ...column,
            portalStatusMappings: [
              ...column.portalStatusMappings,
              {
                id: `new-${id}`,
                featureStatus: statuses.find(
                  (status) => status.id === id
                ) as FeatureStatus,
              },
            ],
          };
        }

        return {
          ...column,
          portalStatusMappings: column.portalStatusMappings.filter(
            (mapping) => mapping.featureStatus.id !== id
          ),
        };
      })
    );

    try {
      const { error } = await updatePortalStatusMapping(
        id as string,
        container as string
      );

      if (error) {
        throw new Error(error);
      }

      toast.success('Status mapping updated');
    } catch (error) {
      handleError(error);
      setColumns(oldColumns);
    }
  };

  return (
    <DndContext collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        }}
      >
        {columns
          .sort((statusA, statusB) => statusA.order - statusB.order)
          .map((status) => (
            <FeatureStatusColumn
              items={statuses.filter((featureStatus) =>
                status.portalStatusMappings.some(
                  (mapping) => mapping.featureStatus.id === featureStatus.id
                )
              )}
              key={status.id}
              {...status}
            />
          ))}
      </div>
      <div className="mt-2">
        <FeatureStatusColumn
          color={tailwind.theme.colors.rose[500]}
          name="Unmapped"
          id="unmapped"
          items={statuses.filter(
            (status) =>
              !columns.some((column) =>
                column.portalStatusMappings.some(
                  (mapping) => mapping.featureStatus.id === status.id
                )
              )
          )}
        />
      </div>
    </DndContext>
  );
};
