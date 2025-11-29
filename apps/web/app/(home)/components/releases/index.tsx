import { Container } from "@repo/design-system/components/container";
import type { HTMLAttributes } from "react";
import { Card } from "@/app/(home)/components/card";
import { FeatureHero } from "@/components/feature-hero";
import { features } from "@/lib/features";
import { JiraIntegrationGraphic } from "./components/jira-integration-graphic";
import { ReleaseStatusGraphic } from "./components/release-status-graphic";

type ReleasesProperties = HTMLAttributes<HTMLDivElement>;

export const Releases = (properties: ReleasesProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.releases} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          description="Eververse will sync Jira releases to Eververse so you can keep track of what's released."
          feature="Jira Sync"
          title="Sync Jira releases to Eververse"
        >
          <JiraIntegrationGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          description="Manage the status of your releases and see where you are in the release process."
          feature="Release Statuses"
          title="Track the status of your releases"
        >
          <ReleaseStatusGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
