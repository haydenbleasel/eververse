import { Card } from '@/app/(home)/components/card';
import { FeatureHero } from '@/components/feature-hero';
import { features } from '@/lib/features';
import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Button } from '@repo/design-system/components/ui/button';
import Image from 'next/image';
import type { HTMLAttributes } from 'react';

type PortalProperties = HTMLAttributes<HTMLDivElement>;

export const Portal = (properties: PortalProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.portal} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-6"
          feature="Portal"
          title="Share your plans, ask for Feedback"
          description="Share your product roadmap and let your users vote on features they want to see."
        >
          <div className="not-prose group flex h-full w-full items-center justify-center">
            <Image
              src="/portal-preview.jpg"
              className="absolute top-0 left-0 m-0 h-full w-full object-cover blur-sm transition-all group-hover:blur-sm sm:blur-none"
              alt=""
              width={2136}
              height={1282}
            />
            <Button variant="secondary" asChild className="relative z-10">
              <Link href="https://eververse.eververse.ai/">
                See the Eververse Portal
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  </section>
);
