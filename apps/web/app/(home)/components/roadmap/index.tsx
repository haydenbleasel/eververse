import { Container } from "@repo/design-system/components/container";
import type { HTMLAttributes } from "react";
import { Card } from "@/app/(home)/components/card";
import { FeatureHero } from "@/components/feature-hero";
import { features } from "@/lib/features";
import { CalendarGraphic } from "./components/calendar-graphic";
import { RoadmapGraphic } from "./components/roadmap-graphic";
import { RoadmapViewsGraphic } from "./components/roadmap-views-graphic";

type RoadmapProperties = HTMLAttributes<HTMLDivElement>;

export const Roadmap = (properties: RoadmapProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.roadmap} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-6"
          description="Eververse helps you create a Gantt chart roadmap based on your ideas and solutions, so you can focus on what matters."
          feature="Gantt View"
          title="Create a visual roadmap"
          wide
        >
          <RoadmapGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          description="Eververse helps you create a calendar view roadmap based on your ideas and solutions, so you can focus on what matters."
          feature="Calendar View"
          title="See your roadmap in a calendar view"
        >
          <CalendarGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          description="Toggle completed events, change the timeframe and more to create a roadmap view that works for you."
          feature="Customizable Views"
          title="Customize your roadmap"
        >
          <RoadmapViewsGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
