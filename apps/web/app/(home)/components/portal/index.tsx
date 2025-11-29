import { Container } from "@repo/design-system/components/container";
import { Link } from "@repo/design-system/components/link";
import { Button } from "@repo/design-system/components/ui/button";
import Image from "next/image";
import type { HTMLAttributes } from "react";
import { Card } from "@/app/(home)/components/card";
import { FeatureHero } from "@/components/feature-hero";
import { features } from "@/lib/features";

type PortalProperties = HTMLAttributes<HTMLDivElement>;

export const Portal = (properties: PortalProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.portal} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-6"
          description="Share your product roadmap and let your users vote on features they want to see."
          feature="Portal"
          title="Share your plans, ask for Feedback"
        >
          <div className="not-prose group flex h-full w-full items-center justify-center">
            <Image
              alt=""
              className="absolute top-0 left-0 m-0 h-full w-full object-cover blur-sm transition-all group-hover:blur-sm sm:blur-none"
              height={1282}
              src="/portal-preview.jpg"
              width={2136}
            />
            <Button asChild className="relative z-10" variant="secondary">
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
