'use client';

import { updateFeatureStatuses } from '@/actions/feature-status/bulk/update';
import type { Feature, FeatureStatus } from '@repo/backend/prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';
import { Reorder } from 'motion/react';
import { useState } from 'react';
import { FeatureStatusItem } from './feature-status-item';

type FeatureStatusesListProperties = {
  readonly initialStatuses: (Pick<
    FeatureStatus,
    'color' | 'complete' | 'id' | 'name'
  > & {
    readonly features: Pick<Feature, 'id'>[];
  })[];
};

export const FeatureStatusesList = ({
  initialStatuses,
}: FeatureStatusesListProperties) => {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [dragging, setDragging] = useState(false);

  const handleDragEnd = async () => {
    setDragging(false);

    const orderedIds = statuses.map((status) => status.id);

    try {
      const { error } = await updateFeatureStatuses(orderedIds);

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Reorder.Group
      axis="y"
      values={statuses}
      onReorder={setStatuses}
      className="divide-y"
    >
      {statuses.map((status) => (
        <Reorder.Item
          key={status.id}
          value={status}
          className={dragging ? 'cursor-grabbing' : 'cursor-grab'}
          onDragStart={() => setDragging(true)}
          onDragEnd={handleDragEnd}
        >
          <FeatureStatusItem data={status} statuses={statuses} />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
