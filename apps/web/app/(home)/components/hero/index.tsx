'use client';

import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from '@repo/design-system/components/ui/kibo-ui/announcement';
import { cn } from '@repo/design-system/lib/utils';
import { ArrowUpRightIcon } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import type { ComponentProps } from 'react';
import { CTAButton } from '../cta-button';

type HeroProperties = ComponentProps<'section'> & {
  readonly latestUpdate: string | undefined;
};

export const Hero = ({
  className,
  latestUpdate,
  ...properties
}: HeroProperties) => (
  <section className={cn('overflow-hidden', className)} {...properties}>
    <LazyMotion features={domAnimation}>
      <Container className="border-x p-4 text-center">
        <div className="rounded-xl border bg-background p-8 shadow-sm sm:p-16 md:p-24">
          <div className="relative z-10 flex flex-col items-center">
            {latestUpdate ? (
              <m.div
                animate={{ opacity: 1, translateY: 0 }}
                initial={{ opacity: 0, translateY: 16 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="w-full"
              >
                <a
                  aria-label="View latest update on Eververse changelog page"
                  href="https://eververse.eververse.ai/changelog"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Announcement>
                    <AnnouncementTag>Latest update</AnnouncementTag>
                    <AnnouncementTitle>
                      {latestUpdate}
                      <ArrowUpRightIcon
                        size={16}
                        className="shrink-0 text-muted-foreground"
                      />
                    </AnnouncementTitle>
                  </Announcement>
                </a>
              </m.div>
            ) : null}
            <div className="mt-8 max-w-6xl">
              <m.h1
                initial={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 1, ease: 'easeInOut', delay: 0.5 }}
                className={cn(
                  'mb-6 text-balance font-semibold tracking-tighter',
                  'text-[2.125rem] sm:text-5xl md:text-6xl'
                )}
              >
                The open source product management platform
              </m.h1>
              <m.p
                className="mx-auto mt-0 max-w-3xl text-balance text-muted-foreground sm:text-lg"
                initial={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 1, ease: 'easeInOut', delay: 1 }}
              >
                Eververse is a simple, open source alternative to tools like
                Productboard and Cycle. Bring your product team together to
                explore problems, ideate solutions, prioritize features and plan
                roadmaps with the help of AI.
              </m.p>
            </div>
            <m.div
              className="mt-8 flex max-w-lg flex-col items-center gap-4 sm:flex-row"
              initial={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 1, ease: 'easeInOut', delay: 1.5 }}
            >
              <CTAButton size="lg" />
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">See pricing</Link>
              </Button>
            </m.div>
          </div>
        </div>
      </Container>
    </LazyMotion>
  </section>
);
