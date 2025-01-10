'use client';

import type { ComponentProps } from 'react';
import {
  Bar,
  BarChart as BarChartComponent,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../../lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import type { ChartConfig } from '../ui/chart';

export type BarChartProperties = {
  readonly config: ChartConfig;
  readonly data: ComponentProps<typeof Bar>['data'];
  readonly color: string;
  readonly className?: string;
  readonly yAxisKey: ComponentProps<typeof YAxis>['dataKey'];
  readonly xAxisKey: ComponentProps<typeof XAxis>['dataKey'];
};

export const BarChart = ({
  config,
  data,
  color,
  className,
  yAxisKey,
  xAxisKey,
}: BarChartProperties) => (
  <ChartContainer config={config} className={cn('w-full', className)}>
    <BarChartComponent
      accessibilityLayer
      data={data}
      layout="vertical"
      margin={{ right: 16 }}
    >
      <CartesianGrid horizontal={false} />
      <YAxis
        dataKey={yAxisKey}
        type="category"
        tickLine={false}
        tickMargin={10}
        axisLine={false}
        tickFormatter={(value: string) => value.slice(0, 3)}
        hide
      />
      <XAxis dataKey={xAxisKey} type="number" hide />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent indicator="line" />}
      />
      <Bar dataKey="count" layout="vertical" fill={color} radius={4}>
        <LabelList
          dataKey="name"
          position="insideLeft"
          offset={8}
          className="fill-background"
          fontSize={12}
        />
        <LabelList
          dataKey="count"
          position="right"
          offset={8}
          className="fill-foreground"
          fontSize={12}
        />
      </Bar>
    </BarChartComponent>
  </ChartContainer>
);
