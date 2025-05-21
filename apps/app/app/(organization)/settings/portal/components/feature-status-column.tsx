'use client';

import { useDroppable } from '@dnd-kit/core';
import type { FeatureStatus } from '@repo/backend/prisma/client';
import { cn } from '@repo/design-system/lib/utils';
import { FeatureStatusCard } from './feature-status-card';

type FeatureStatusColumnProperties = Pick<
  FeatureStatus,
  'color' | 'id' | 'name'
> & {
  readonly items: Pick<FeatureStatus, 'color' | 'id' | 'name'>[];
};

export const FeatureStatusColumn = ({
  id,
  name,
  color,
  items,
}: FeatureStatusColumnProperties) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        'flex min-h-40 flex-col gap-2 rounded-lg bg-card p-2 outline outline-2 transition-all',
        isOver ? 'outline-violet-500' : 'outline-transparent'
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <p className="m-0 font-semibold text-sm">{name}</p>
      </div>
      <div className="flex flex-1 flex-col gap-2" ref={setNodeRef}>
        {items.map((item, index) => (
          <FeatureStatusCard
            key={item.id}
            index={index}
            parent={id}
            {...item}
          />
        ))}
      </div>
    </div>
  );
};
