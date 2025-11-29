"use client";

import { Prose } from "@repo/design-system/components/prose";
import { domAnimation, LazyMotion, m, useInView } from "motion/react";
import { useRef } from "react";

const trends =
  "In the last 30 days, the amount of negative feedback related to the checkout process has increased by 20%. However, the amount of positive feedback related to integrations has increased by 10%.";

export const TrendsGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "some" });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <Prose className="flex h-full w-full items-center justify-center p-6">
        <p className="m-0 line-clamp-5 text-sm">
          {[...trends].map((char, index) => (
            <m.span
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              key={index}
              transition={{
                delay: 1 + index * 0.01,
                duration: 0.01,
              }}
            >
              {char}
            </m.span>
          ))}
        </p>
      </Prose>
    </LazyMotion>
  );
};
