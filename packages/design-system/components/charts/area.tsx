'use client';

import type { ComponentProps } from 'react';
import {
  Area,
  AreaChart as AreaChartComponent,
  CartesianGrid,
  XAxis,
} from 'recharts';
import { cn } from '../../lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import type { ChartConfig } from '../ui/chart';

export type AreaChartProperties = {
  readonly config: ChartConfig;
  readonly data: ComponentProps<typeof Area>['data'];
  readonly dataKey: ComponentProps<typeof Area>['dataKey'];
  readonly axisKey: ComponentProps<typeof XAxis>['dataKey'];
  readonly className?: string;
};

export const AreaChart = ({
  data,
  config,
  dataKey,
  axisKey,
  className,
}: AreaChartProperties) => (
  <ChartContainer config={config} className={cn('w-full', className)}>
    <AreaChartComponent
      accessibilityLayer
      data={data}
      margin={{
        top: 16,
        bottom: 16,
        left: 0,
        right: 0,
      }}
    >
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey={axisKey}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent indicator="dot" />}
      />
      <Area
        dataKey={dataKey}
        type="natural"
        fill={Object.values(config)?.at(0)?.color}
        fillOpacity={0.4}
        stroke={Object.values(config)?.at(0)?.color}
        stackId="1"
      />
    </AreaChartComponent>
  </ChartContainer>
);
