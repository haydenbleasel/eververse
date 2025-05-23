'use client';

import { Container } from '@repo/design-system/components/container';
import { cn } from '@repo/design-system/lib/utils';
import { LazyMotion, domAnimation, m, useInView } from 'motion/react';
import { useRef } from 'react';
import type { ComponentProps } from 'react';

type CustomersProperties = ComponentProps<'section'> & {
  readonly count: number;
};

import * as logos from './logos';

export const Customers = ({
  className,
  count,
  ...properties
}: CustomersProperties) => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: 'some' });

  // Round count down to the nearest 50
  const closest = Math.floor(count / 50) * 50;

  return (
    <section
      className={cn('overflow-hidden', className)}
      ref={reference}
      {...properties}
    >
      <LazyMotion features={domAnimation}>
        <Container className="relative flex flex-col items-center justify-between gap-8 border-x py-16">
          <m.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            Join {closest}+ companies in building better products with Eververse
          </m.p>
          <div className="grid grid-cols-3 gap-8 text-foreground sm:grid-cols-5">
            {Object.entries(logos).map(([name, Logo], index) => (
              <m.div
                key={name}
                className="flex items-center justify-center"
                initial={{ opacity: 0, transform: 'translateY(1rem)' }}
                animate={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(1rem)',
                }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Logo className="h-10 w-auto" />
              </m.div>
            ))}
          </div>
        </Container>
      </LazyMotion>
    </section>
  );
};
