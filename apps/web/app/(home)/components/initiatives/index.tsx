import { Card } from '@/app/(home)/components/card';
import { FeatureHero } from '@/components/feature-hero';
import { features } from '@/lib/features';
import { Container } from '@repo/design-system/components/container';
import type { HTMLAttributes } from 'react';
import { CanvasGraphic } from './components/canvas-graphic';
import { InitiativesGraphic } from './components/initiatives-graphic';
import { UpdatesGraphic } from './components/updates-graphic';

type InitiativesProperties = HTMLAttributes<HTMLDivElement>;

export const Initiatives = (properties: InitiativesProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.initiatives} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          feature="Initiatives"
          title="Create a home for your ideas"
          description="Organize your thoughts, track progress, and share updates with your team."
        >
          <InitiativesGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          feature="Updates"
          title="Send updates to your team"
          description="Share your progress, ask for feedback, and keep your team in the loop."
        >
          <UpdatesGraphic />
        </Card>
        <Card
          className="h-full md:col-span-6"
          feature="Canvas"
          title="Next-gen brainstorming"
          description="Capture free-flowing thoughts and collaborate on ideas with a digital whiteboard."
          wide
        >
          <CanvasGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
