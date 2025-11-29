"use client";

import { cn } from "@repo/design-system/lib/utils";
import { motion } from "motion/react";

type AnimatedTabsProps = {
  value: string;
  options: {
    id: string;
    label: string;
  }[];
  onChange?: (tab: string) => void;
};

export const AnimatedTabs = ({
  value,
  options,
  onChange,
}: AnimatedTabsProps) => (
  <div className="inline-flex rounded-full bg-foreground/5 p-1">
    <div className="relative flex">
      <motion.div
        className="absolute h-full rounded-full bg-primary"
        layout
        style={{
          width: `${100 / options.length}%`,
          left: `${(options.findIndex((option) => option.id === value) * 100) / options.length}%`,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
      />
      {options.map((option) => (
        <button
          className={cn(
            "relative z-10 flex-1 rounded-full px-6 py-2 font-medium text-sm transition-colors duration-200",
            value === option.id ? "text-white" : "text-muted-foreground"
          )}
          key={option.id}
          onClick={() => onChange?.(option.id)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);
