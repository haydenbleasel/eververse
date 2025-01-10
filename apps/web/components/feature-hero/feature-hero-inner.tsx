'use client';

import type { Feature } from '@/lib/features';
import { Container } from '@repo/design-system/components/container';
import { Badge } from '@repo/design-system/components/ui/badge';
import { LazyMotion, domAnimation, m } from 'motion/react';
import type { ReactNode } from 'react';
import Balancer from 'react-wrap-balancer';

type FeatureHeroInnerProperties = Omit<Feature, 'icon'> & {
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <Badge className="items-center gap-2 rounded-full bg-background px-4 py-1.5 text-foreground text-sm hover:bg-background">
            {children}
            {name}
          </Badge>
        </m.div>
        <div className="mt-8 mb-4">
          <p className="m-0 mx-auto text-center font-semibold text-2xl tracking-tighter sm:text-3xl md:text-5xl">
            <Balancer>
              <m.span
                className="text-muted-foreground line-through"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {formerly}
              </m.span>
            </Balancer>
          </p>
          <h1 className="m-0 mx-auto text-center font-semibold text-2xl tracking-tighter sm:text-3xl md:text-5xl">
            <Balancer>
              <m.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
