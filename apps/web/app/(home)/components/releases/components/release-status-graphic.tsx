"use client";

import type { release_state } from "@repo/backend/prisma/client";
import { colors } from "@repo/design-system/lib/colors";
import { useInView } from "motion/react";
import { useRef } from "react";

const statuses: {
  name: string;
  id: release_state;
  color: string;
}[] = [
  {
    name: "Planned",
    id: "PLANNED",
    color: colors.gray,
  },
  {
    name: "In Progress",
    id: "ACTIVE",
    color: colors.amber,
  },
  {
    name: "Completed",
    id: "COMPLETED",
    color: colors.emerald,
  },
  {
    name: "Cancelled",
    id: "CANCELLED",
    color: colors.rose,
  },
];

export const ReleaseStatusGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "all" });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <div className="not-prose flex h-full w-full items-center justify-center p-8">
      <div className="w-full space-y-1">
        {statuses.map((item) => (
          <div
            className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-sm"
            key={item.name}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <input
              aria-label="Feature status"
              className="flex-1 bg-transparent text-sm outline-none"
              defaultValue={item.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
