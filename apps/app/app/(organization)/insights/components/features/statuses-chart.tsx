import type { PieChartProperties } from "@repo/design-system/components/charts/pie";
import { PieChart } from "@repo/design-system/components/charts/pie";
import { StackCard } from "@repo/design-system/components/stack-card";
import { slugify } from "@repo/lib/slugify";
import { ListIcon } from "lucide-react";
import { database } from "@/lib/database";

export const StatusesChart = async () => {
  const features = await database.feature.findMany({
    select: {
      status: {
        select: {
          color: true,
          name: true,
        },
      },
    },
  });

  const data: {
    status: string;
    count: number;
    fill: string;
  }[] = [];

  const config: PieChartProperties["config"] = {};

  for (const feature of features) {
    const slug = slugify(feature.status.name);

    config[slug] = {
      label: feature.status.name,
      color: feature.status.color,
    };

    const index = data.findIndex(
      ({ status }) => status === feature.status.name
    );

    if (index === -1) {
      data.push({
        status: feature.status.name,
        count: 1,
        fill: feature.status.color,
      });
    } else {
      data[index].count += 1;
    }
  }

  return (
    <StackCard icon={ListIcon} title="Feature Statuses">
      <PieChart
        className="mx-auto h-80"
        config={config}
        data={data}
        dataKey="count"
        nameKey="status"
      />
    </StackCard>
  );
};
