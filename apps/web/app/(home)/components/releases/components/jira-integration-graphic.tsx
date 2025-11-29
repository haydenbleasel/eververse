"use client";

import { cn } from "@repo/design-system/lib/utils";
import {
  domMax,
  LazyMotion,
  m,
  useDragControls,
  useInView,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

const jira = "/jira.svg";

const items: {
  name: string;
  version: string;
  image: string;
  left: string;
  top: string;
}[] = [
  {
    name: "Optimize for mobile",
    version: "v1.0.0",
    image: jira,
    left: "60%",
    top: "-5%",
  },
  {
    name: "Add dark mode",
    version: "v1.0.1",
    image: jira,
    left: "10%",
    top: "10%",
  },
  {
    name: "Redesign checkout flow",
    version: "v1.0.2",
    image: jira,
    left: "50%",
    top: "20%",
  },
  {
    name: "New pricing plans",
    version: "v1.2.0",
    image: jira,
    left: "20%",
    top: "35%",
  },
  {
    name: "New dashboard",
    version: "v1.2.1",
    image: jira,
    left: "70%",
    top: "50%",
  },
  {
    name: "Revise onboarding flow",
    version: "v1.3.1",
    image: jira,
    left: "-2%",
    top: "60%",
  },
  {
    name: "Refactor backend code",
    version: "v1.3.2",
    image: jira,
    left: "50%",
    top: "70%",
  },
  {
    name: "Improve SEO",
    version: "v1.3.3",
    image: jira,
    left: "10%",
    top: "85%",
  },
];

const Draggable = ({
  name,
  version,
  image,
  left,
  top,
  index,
}: (typeof items)[0] & {
  readonly index: number;
}) => {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <m.div
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "absolute flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border bg-card p-3 pr-5 font-medium",
        dragging ? "cursor-grabbing" : "cursor-grab"
      )}
      drag
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      dragControls={controls}
      initial={{ opacity: 0, scale: 0.5 }}
      onDragEnd={() => setDragging(false)}
      onDragStart={() => setDragging(true)}
      style={{ left, top }}
      transition={{ delay: index * 0.25, bounce: 0.5, type: "spring" }}
    >
      <Image alt="" className="shrink-0" height={24} src={image} width={24} />
      <div className="flex items-center gap-2 truncate">
        <p className="text-muted-foreground text-sm">{version}</p>
        <p className="text-sm">{name}</p>
      </div>
    </m.div>
  );
};

export const JiraIntegrationGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "all" });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <LazyMotion features={domMax}>
      <div className="not-prose flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Draggable index={index} {...item} key={item.name} />
        ))}
      </div>
    </LazyMotion>
  );
};
