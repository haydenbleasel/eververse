"use client";

import type { ComponentProps } from "react";
import {
  Bar,
  BarChart as BarChartComponent,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../../lib/utils";
import type { ChartConfig } from "../ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

export type BarChartProperties = {
  readonly config: ChartConfig;
  readonly data: ComponentProps<typeof Bar>["data"];
  readonly color: string;
  readonly className?: string;
  readonly yAxisKey: ComponentProps<typeof YAxis>["dataKey"];
  readonly xAxisKey: ComponentProps<typeof XAxis>["dataKey"];
};

export const BarChart = ({
  config,
  data,
  color,
  className,
  yAxisKey,
  xAxisKey,
}: BarChartProperties) => (
  <ChartContainer className={cn("w-full", className)} config={config}>
    <BarChartComponent
      accessibilityLayer
      data={data}
      layout="vertical"
      margin={{ right: 16 }}
    >
      <CartesianGrid horizontal={false} />
      <YAxis
        axisLine={false}
        dataKey={yAxisKey}
        hide
        tickFormatter={(value: string) => value.slice(0, 3)}
        tickLine={false}
        tickMargin={10}
        type="category"
      />
      <XAxis dataKey={xAxisKey} hide type="number" />
      <ChartTooltip
        content={<ChartTooltipContent indicator="line" />}
        cursor={false}
      />
      <Bar dataKey="count" fill={color} layout="vertical" radius={4}>
        <LabelList
          className="fill-background"
          dataKey="name"
          fontSize={12}
          offset={8}
          position="insideLeft"
        />
        <LabelList
          className="fill-foreground"
          dataKey="count"
          fontSize={12}
          offset={8}
          position="right"
        />
      </Bar>
    </BarChartComponent>
  </ChartContainer>
);
