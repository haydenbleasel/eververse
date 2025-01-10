'use client';

import { tailwind } from '@repo/tailwind-config';
import type { ComponentProps } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RadarChartComponent,
} from 'recharts';
import { cn } from '../../lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import type { ChartConfig } from '../ui/chart';

export type RadarChartProperties = {
  readonly config: ChartConfig;
  readonly data: ComponentProps<typeof RadarChartComponent>['data'];
  readonly dataKey: ComponentProps<typeof Radar>['dataKey'];
  readonly axisKey: ComponentProps<typeof PolarAngleAxis>['dataKey'];
  readonly className?: string;
};

export const RadarChart = ({
  config,
  data,
  dataKey,
  axisKey,
  className,
}: RadarChartProperties) => (
  <ChartContainer config={config} className={cn('aspect-square', className)}>
    <RadarChartComponent data={data}>
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <PolarAngleAxis dataKey={axisKey} />
      <PolarGrid />
      <Radar
        dataKey={dataKey}
        fill={tailwind.theme.colors.violet[500]}
        fillOpacity={0.6}
      />
    </RadarChartComponent>
  </ChartContainer>
);
