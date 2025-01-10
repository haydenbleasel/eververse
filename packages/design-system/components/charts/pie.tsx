'use client';

import type { ComponentProps } from 'react';
import { Pie, PieChart as PieChartComponent } from 'recharts';
import { cn } from '../../lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import type { ChartConfig } from '../ui/chart';

export type PieChartProperties = {
  readonly config: ChartConfig;
  readonly data: ComponentProps<typeof Pie>['data'];
  readonly dataKey: ComponentProps<typeof Pie>['dataKey'];
  readonly nameKey: ComponentProps<typeof Pie>['nameKey'];
  readonly className?: string;
};

export const PieChart = ({
  config,
  data,
  dataKey,
  nameKey,
  className,
}: PieChartProperties) => (
  <ChartContainer config={config} className={cn('aspect-square', className)}>
    <PieChartComponent>
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent hideLabel />}
      />
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        innerRadius={80}
        strokeWidth={5}
      />
    </PieChartComponent>
  </ChartContainer>
);
