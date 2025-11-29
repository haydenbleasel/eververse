"use client";

import { colors } from "@repo/design-system/lib/colors";
import { GripVerticalIcon } from "lucide-react";
import { domMax, LazyMotion, Reorder, useInView } from "motion/react";
import { useRef, useState } from "react";

const statuses = [
  {
    name: "Backlog",
    count: 10,
    color: colors.gray,
  },
  {
    name: "In Progress",
    count: 5,
    color: colors.amber,
  },
  {
    name: "In Review",
    count: 6,
    color: colors.sky,
  },
  {
    name: "Done",
    count: 3,
    color: colors.emerald,
  },
];

export const FeatureStatusGraphic = () => {
  const [items, setItems] = useState(statuses);
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "all" });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <div className="not-prose flex h-full w-full items-center justify-center p-8">
      <LazyMotion features={domMax}>
        <Reorder.Group
          axis="y"
          className="w-full space-y-1"
          onReorder={setItems}
          values={items}
        >
          {items.map((item) => (
            <Reorder.Item
              className="flex items-center gap-2 rounded border bg-card px-3 py-1.5 shadow-sm"
              key={item.name}
              value={item}
            >
              <GripVerticalIcon
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
                size={16}
              />
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <input
                aria-label="Feature status"
                className="flex-1 bg-transparent text-sm outline-none"
                defaultValue={item.name}
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
