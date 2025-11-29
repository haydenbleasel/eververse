"use client";

import type { ComponentProps } from "react";
import { Pie, PieChart as PieChartComponent } from "recharts";
import { cn } from "../../lib/utils";
import type { ChartConfig } from "../ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

export type PieChartProperties = {
  readonly config: ChartConfig;
  readonly data: ComponentProps<typeof Pie>["data"];
  readonly dataKey: ComponentProps<typeof Pie>["dataKey"];
  readonly nameKey: ComponentProps<typeof Pie>["nameKey"];
  readonly className?: string;
};

export const PieChart = ({
  config,
  data,
  dataKey,
  nameKey,
  className,
}: PieChartProperties) => (
  <ChartContainer className={cn("aspect-square", className)} config={config}>
    <PieChartComponent>
      <ChartTooltip
        content={<ChartTooltipContent hideLabel />}
        cursor={false}
      />
      <Pie
        data={data}
        dataKey={dataKey}
        innerRadius={80}
        nameKey={nameKey}
        strokeWidth={5}
      />
    </PieChartComponent>
  </ChartContainer>
);
