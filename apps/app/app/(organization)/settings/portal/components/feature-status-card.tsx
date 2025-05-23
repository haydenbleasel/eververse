import { useDraggable } from '@dnd-kit/core';
import type { FeatureStatus } from '@repo/backend/prisma/client';
import { cn } from '@repo/design-system/lib/utils';

export const FeatureStatusCard = ({
  id,
  name,
  index,
  parent,
  color,
}: {
  readonly id: FeatureStatus['id'];
  readonly name: FeatureStatus['name'];
  readonly color: FeatureStatus['color'];
  readonly index: number;
  readonly parent: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { index, parent },
    });

  return (
    <div
      className={cn(
        'flex cursor-grab items-center gap-2 rounded-md border bg-background p-2 shadow-sm',
        isDragging && 'cursor-grabbing'
      )}
      style={{
        transform: transform
          ? `translateX(${transform.x}px) translateY(${transform.y}px)`
          : 'none',
      }}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <p className="m-0 font-medium text-sm">{name}</p>
    </div>
  );
};
