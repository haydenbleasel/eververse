'use client';

import { tailwind } from '@repo/tailwind-config';
import { GripVerticalIcon } from 'lucide-react';
import { LazyMotion, Reorder, domMax, useInView } from 'motion/react';
import { useRef, useState } from 'react';

const statuses = [
  {
    name: 'Backlog',
    count: 10,
    color: tailwind.theme.colors.gray[500],
  },
  {
    name: 'In Progress',
    count: 5,
    color: tailwind.theme.colors.amber[500],
  },
  {
    name: 'In Review',
    count: 6,
    color: tailwind.theme.colors.sky[500],
  },
  {
    name: 'Done',
    count: 3,
    color: tailwind.theme.colors.emerald[500],
  },
];

export const FeatureStatusGraphic = () => {
  const [items, setItems] = useState(statuses);
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: 'all' });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <div className="not-prose flex h-full w-full items-center justify-center p-8">
      <LazyMotion features={domMax}>
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          className="w-full space-y-1"
        >
          {items.map((item) => (
            <Reorder.Item
              key={item.name}
              value={item}
              className="flex items-center gap-2 rounded border bg-card px-3 py-1.5 shadow-sm"
            >
              <GripVerticalIcon
                size={16}
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
              />
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <input
                className="flex-1 bg-transparent text-sm outline-none"
                defaultValue={item.name}
                aria-label="Feature status"
              />
              <span className="flex h-6 w-6 items-center justify-center rounded border font-mono text-xs">
                {item.count}
              </span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </LazyMotion>
    </div>
  );
};
