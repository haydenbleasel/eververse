'use client';

import {
  BookIcon,
  ChevronsRightIcon,
  CircleArrowUpIcon,
  GripVerticalIcon,
  SlackIcon,
} from 'lucide-react';
import { LazyMotion, Reorder, domMax, useInView } from 'motion/react';
import { useRef, useState } from 'react';

const links = [
  {
    name: 'Documentation',
    icon: BookIcon,
  },
  {
    name: 'Slack Community',
    icon: SlackIcon,
  },
  {
    name: 'Request a free trial',
    icon: ChevronsRightIcon,
  },
  {
    name: 'Upgrade your plan',
    icon: CircleArrowUpIcon,
  },
];

export const WidgetLinkGraphic = () => {
  const [items, setItems] = useState(links);
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
              className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-sm"
            >
              <GripVerticalIcon
                size={16}
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
              />
              <item.icon size={16} className="shrink-0 text-muted-foreground" />
              <p className="font-medium text-sm">{item.name}</p>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </LazyMotion>
    </div>
  );
};
