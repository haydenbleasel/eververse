import { Container } from "@repo/design-system/components/container";
import type { HTMLAttributes } from "react";
import { Card } from "@/app/(home)/components/card";
import { FeatureHero } from "@/components/feature-hero";
import { features } from "@/lib/features";
import { ChangelogGraphic } from "./components/changelog-graphic";
import { GenerativeChangelogGraphic } from "./components/generative-changelog-graphic";

type ChangelogProperties = HTMLAttributes<HTMLDivElement>;

export const Changelog = (properties: ChangelogProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.changelog} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          description="Keep your users and stakeholders informed with a beautiful, searchable changelog."
          feature="Rich Changelog Editor"
          title="Stay in the loop"
        >
          <ChangelogGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          description="Eververse can use your roadmap to generate changelogs for you, saving you time and effort."
          feature="AI-Generated Updates"
          title="Generate changelogs using AI"
        >
          <GenerativeChangelogGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
