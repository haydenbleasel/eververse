import { Container } from "@repo/design-system/components/container";
import type { HTMLAttributes } from "react";
import { FeatureHero } from "@/components/feature-hero";
import { integrations } from "@/lib/features";
import { Card } from "../card";
import { APIGraphic } from "./components/api-graphic";
import { FeatureIntegrationsGraphic } from "./components/feature-integrations-graphic";
import { FeedbackIntegrationsGraphic } from "./components/feedback-integrations-graphic";

type IntegrationsProperties = HTMLAttributes<HTMLDivElement>;

export const Integrations = (properties: IntegrationsProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...integrations} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          description="Connect Eververse to Zapier, Intercom, Slack, Email and more to capture feedback from anywhere."
          feature="Integrations"
          title="A single source of truth"
        >
          <FeedbackIntegrationsGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          description="Push and pull features from your favorite tools like Jira, GitHub and Linear."
          feature="Bidirectional Feature Sync"
          title="Deliver with transparency"
        >
          <FeatureIntegrationsGraphic />
        </Card>
        <Card
          className="h-full md:col-span-6"
          description="Use our API to build custom integrations and automate your workflows."
          feature="API"
          title="Build your own integrations"
          wide
        >
          <APIGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
