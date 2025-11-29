import { Container } from "@repo/design-system/components/container";
import type { HTMLAttributes } from "react";
import { FeatureHero } from "@/components/feature-hero";
import { features } from "@/lib/features";
import { Card } from "../card";
import { WidgetGraphic } from "./components/widget-graphic";
import { WidgetLinkGraphic } from "./components/widget-link-graphic";

type WidgetProperties = HTMLAttributes<HTMLDivElement>;

export const Widget = (properties: WidgetProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.widget} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          description="Just copy and paste a code snippet into your website or app and you're good to go."
          feature="Widgets"
          title="Deploy a widget in minutes"
        >
          <WidgetGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          description="Link out to documentation, support, Slack communities or any other page you want."
          feature="Customizable Links"
          title="Customize your widget links"
        >
          <WidgetLinkGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
