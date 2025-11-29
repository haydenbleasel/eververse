"use client";

import type { ComponentProps } from "react";
import { RadialBar, RadialBarChart } from "recharts";
import { cn } from "../../lib/utils";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

export type RadialChartProperties = {
  readonly config: ChartConfig;
  readonly data: ComponentProps<typeof RadialBar>["data"];
  readonly dataKey: ComponentProps<typeof RadialBar>["dataKey"];
  readonly nameKey: ComponentProps<typeof ChartTooltipContent>["nameKey"];
  readonly className?: string;
};

export const RadialChart = ({
  data,
  config,
  nameKey,
  className,
  dataKey,
}: RadialChartProperties) => (
  <ChartContainer className={cn("aspect-square", className)} config={config}>
    <RadialBarChart data={data} innerRadius={30} outerRadius={110}>
      <ChartTooltip
        content={<ChartTooltipContent hideLabel nameKey={nameKey} />}
        cursor={false}
      />
      <RadialBar background dataKey={dataKey} />
    </RadialBarChart>
  </ChartContainer>
);
