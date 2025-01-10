import { Card } from '@/app/(home)/components/card';
import { FeatureHero } from '@/components/feature-hero';
import { features } from '@/lib/features';
import { Container } from '@repo/design-system/components/container';
import type { HTMLAttributes } from 'react';
import { ActivityGraphic } from './components/activity-graphic';
import { PresenceGraphic } from './components/presence-graphic';

type ActivityProperties = HTMLAttributes<HTMLDivElement>;

export const Activity = (properties: ActivityProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.activity} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          feature="Activity Log"
          title="Stay up to date"
          description="Eververse keeps a log of all activity across your product team, from new features to portal updates."
        >
          <ActivityGraphic />
        </Card>
        {/* <Card
    className="h-full md:col-span-3"
    feature="AI-Powered Digests"
    title="What's new?"
    description="Eververse takes your team's activity and summarizes it into a digestible format, so you can stay in sync."
    badge="Coming soon"
  >
    <DigestGraphic />
  </Card>
  <Card
    className="h-full md:col-span-3"
    feature="AI Trend Analysis"
    title="Stay ahead of the curve"
    description="Keep tabs on upcoming trends and opportunities in customer feedback."
    badge="Coming soon"
  >
    <TrendsGraphic />
  </Card> */}
        <Card
          className="h-full md:col-span-3"
          feature="Presence"
          title="See who's active"
          description="Get a real-time view of who's on Eververse and what they're working on."
        >
          <PresenceGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
