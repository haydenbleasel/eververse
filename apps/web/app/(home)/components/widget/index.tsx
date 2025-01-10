import { FeatureHero } from '@/components/feature-hero';
import { features } from '@/lib/features';
import { Container } from '@repo/design-system/components/container';
import type { HTMLAttributes } from 'react';
import { Card } from '../card';
import { WidgetGraphic } from './components/widget-graphic';
import { WidgetLinkGraphic } from './components/widget-link-graphic';

type WidgetProperties = HTMLAttributes<HTMLDivElement>;

export const Widget = (properties: WidgetProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.widget} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          feature="Widgets"
          title="Deploy a widget in minutes"
          description="Just copy and paste a code snippet into your website or app and you're good to go."
        >
          <WidgetGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          feature="Customizable Links"
          title="Customize your widget links"
          description="Link out to documentation, support, Slack communities or any other page you want."
        >
          <WidgetLinkGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
