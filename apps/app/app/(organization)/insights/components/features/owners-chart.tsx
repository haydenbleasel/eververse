import { getUserName } from "@repo/backend/auth/format";
import { currentMembers } from "@repo/backend/auth/utils";
import type { BarChartProperties } from "@repo/design-system/components/charts/bar";
import { BarChart } from "@repo/design-system/components/charts/bar";
import { StackCard } from "@repo/design-system/components/stack-card";
import { colors } from "@repo/design-system/lib/colors";
import { slugify } from "@repo/lib/slugify";
import { UserCircleIcon } from "lucide-react";
import { database } from "@/lib/database";

export const OwnersChart = async () => {
  const [features, members] = await Promise.all([
    database.feature.findMany({
      select: {
        id: true,
        ownerId: true,
      },
    }),
    currentMembers(),
  ]);

  const data: {
    id: string;
    name: string;
    count: number;
  }[] = [];

  for (const feature of features) {
    const owner = members.find(({ id }) => id === feature.ownerId);

    if (owner) {
      const name = getUserName(owner);
      const slug = slugify(name ?? "Unknown");
      const existing = data.find((item) => item.id === slug);

      if (existing) {
        existing.count += 1;
      } else {
        data.push({
          id: slug,
          name,
          count: 1,
        });
      }
    }
  }

  const config: BarChartProperties["config"] = {};

  for (const [_index, item] of data.entries()) {
    config[item.id] = {
      label: item.name,
      color: colors.violet,
    };
  }

  return (
    <StackCard className="p-8" icon={UserCircleIcon} title="Feature Owners">
      <BarChart
        className="mx-auto h-80"
        color={colors.violet}
        config={config}
        data={data}
        xAxisKey="count"
        yAxisKey="name"
      />
    </StackCard>
  );
};
