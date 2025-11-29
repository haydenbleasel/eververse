"use client";

import type { ComponentProps } from "react";
import {
  Area,
  AreaChart as AreaChartComponent,
  CartesianGrid,
  XAxis,
} from "recharts";
import { cn } from "../../lib/utils";
import type { ChartConfig } from "../ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

export type AreaChartProperties = {
  readonly config: ChartConfig;
  readonly data: ComponentProps<typeof Area>["data"];
  readonly dataKey: ComponentProps<typeof Area>["dataKey"];
  readonly axisKey: ComponentProps<typeof XAxis>["dataKey"];
  readonly className?: string;
};

export const AreaChart = ({
  data,
  config,
  dataKey,
  axisKey,
  className,
}: AreaChartProperties) => (
  <ChartContainer className={cn("w-full", className)} config={config}>
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
        axisLine={false}
        dataKey={axisKey}
        tickFormatter={(value) => value.slice(0, 3)}
        tickLine={false}
        tickMargin={8}
      />
      <ChartTooltip
        content={<ChartTooltipContent indicator="dot" />}
        cursor={false}
      />
      <Area
        dataKey={dataKey}
        fill={Object.values(config)?.at(0)?.color}
        fillOpacity={0.4}
        stackId="1"
        stroke={Object.values(config)?.at(0)?.color}
        type="natural"
      />
    </AreaChartComponent>
  </ChartContainer>
);
