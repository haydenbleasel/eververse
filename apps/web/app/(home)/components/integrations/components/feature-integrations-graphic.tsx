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

const github = "/github.svg";
const linear = "/linear.svg";
const jira = "/jira.svg";

const items: {
  name: string;
  issue: string;
  image: string;
  left: string;
  top: string;
}[] = [
  {
    name: "Optimize for mobile",
    issue: "#105",
    image: github,
    left: "60%",
    top: "-5%",
  },
  {
    name: "Add dark mode",
    issue: "EVE-15",
    image: linear,
    left: "10%",
    top: "10%",
  },
  {
    name: "Redesign checkout flow",
    issue: "KAN-12",
    image: jira,
    left: "50%",
    top: "20%",
  },
  {
    name: "New pricing plans",
    issue: "#514",
    image: github,
    left: "20%",
    top: "35%",
  },
  {
    name: "New dashboard",
    issue: "EVE-21",
    image: linear,
    left: "70%",
    top: "50%",
  },
  {
    name: "Revise onboarding flow",
    issue: "KAN-145",
    image: jira,
    left: "-2%",
    top: "60%",
  },
  {
    name: "Refactor backend code",
    issue: "#22",
    image: github,
    left: "50%",
    top: "70%",
  },
  {
    name: "Improve SEO",
    issue: "EVE-91",
    image: linear,
    left: "10%",
    top: "85%",
  },
];

const Draggable = ({
  name,
  issue,
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
        <p className="text-muted-foreground text-sm">{issue}</p>
        <p className="text-sm">{name}</p>
      </div>
    </m.div>
  );
};

export const FeatureIntegrationsGraphic = () => {
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
