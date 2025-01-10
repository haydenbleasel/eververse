import { Card } from '@/app/(home)/components/card';
import { FeatureHero } from '@/components/feature-hero';
import { features } from '@/lib/features';
import { Container } from '@repo/design-system/components/container';
import type { HTMLAttributes } from 'react';
import { ChangelogGraphic } from './components/changelog-graphic';
import { GenerativeChangelogGraphic } from './components/generative-changelog-graphic';

type ChangelogProperties = HTMLAttributes<HTMLDivElement>;

export const Changelog = (properties: ChangelogProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.changelog} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          feature="Rich Changelog Editor"
          title="Stay in the loop"
          description="Keep your users and stakeholders informed with a beautiful, searchable changelog."
        >
          <ChangelogGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          feature="AI-Generated Updates"
          title="Generate changelogs using AI"
          description="Eververse can use your roadmap to generate changelogs for you, saving you time and effort."
        >
          <GenerativeChangelogGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
