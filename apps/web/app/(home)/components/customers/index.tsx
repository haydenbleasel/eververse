"use client";

import { Container } from "@repo/design-system/components/container";
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@repo/design-system/components/ui/kibo-ui/marquee";
import { cn } from "@repo/design-system/lib/utils";
import { domAnimation, LazyMotion, m, useInView } from "motion/react";
import type { ComponentProps } from "react";
import { useRef } from "react";

type CustomersProperties = ComponentProps<"section"> & {
  readonly count: number;
};

import * as logos from "./logos";

export const Customers = ({
  className,
  count,
  ...properties
}: CustomersProperties) => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "some" });

  // Round count down to the nearest 50
  const closest = Math.floor(count / 50) * 50;

  return (
    <section
      className={cn("overflow-hidden", className)}
      ref={reference}
      {...properties}
    >
      <LazyMotion features={domAnimation}>
        <Container className="relative flex flex-col items-center justify-between gap-12 border-x py-16">
          <m.p
            animate={{ opacity: inView ? 1 : 0 }}
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            Join {closest}+ companies in building better products with Eververse
          </m.p>
          <Marquee>
            <MarqueeFade className="from-backdrop" side="left" />
            <MarqueeFade className="from-backdrop" side="right" />
            <MarqueeContent pauseOnHover={false}>
              {Object.entries(logos).map(([name, Logo]) => (
                <MarqueeItem className="h-6 w-auto px-8" key={name}>
                  <Logo className="h-6 w-auto" />
                </MarqueeItem>
              ))}
            </MarqueeContent>
          </Marquee>
        </Container>
      </LazyMotion>
    </section>
  );
};
