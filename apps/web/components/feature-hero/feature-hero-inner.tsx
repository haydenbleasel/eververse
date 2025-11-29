"use client";

import { Container } from "@repo/design-system/components/container";
import { Badge } from "@repo/design-system/components/ui/badge";
import { domAnimation, LazyMotion, m } from "motion/react";
import type { ReactNode } from "react";
import Balancer from "react-wrap-balancer";
import type { Feature } from "@/lib/features";

type FeatureHeroInnerProperties = Omit<Feature, "icon"> & {
  readonly children: ReactNode;
};

export const FeatureHeroInner = ({
  description,
  formerly,
  name,
  children,
}: FeatureHeroInnerProperties) => (
  <section className="relative z-10">
    <Container>
      <LazyMotion features={domAnimation}>
        <m.div
          animate={{ opacity: 1 }}
          className="flex items-center justify-center"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            className="items-center gap-2 rounded-full px-4 py-1.5 text-foreground text-sm"
            variant="outline"
          >
            {children}
            {name}
          </Badge>
        </m.div>
        <div className="mt-8 mb-4">
          <p className="m-0 mx-auto text-center font-semibold text-2xl tracking-tighter sm:text-3xl md:text-5xl">
            <Balancer>
              <m.span
                animate={{ opacity: 1 }}
                className="text-border line-through"
                initial={{ opacity: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {formerly}
              </m.span>
            </Balancer>
          </p>
          <h1 className="m-0 mx-auto text-center font-semibold text-2xl text-primary tracking-tighter sm:text-3xl md:text-5xl">
            <Balancer>
              <m.span
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                {description}
              </m.span>
            </Balancer>
          </h1>
        </div>
      </LazyMotion>
    </Container>
  </section>
);
