import {
  AreaChart,
  type AreaChartProperties,
} from "@repo/design-system/components/charts/area";
import { StackCard } from "@repo/design-system/components/stack-card";
import { colors } from "@repo/design-system/lib/colors";
import { ChartAreaIcon } from "lucide-react";
import { database } from "@/lib/database";

export const IncomingChart = async () => {
  const feedback = await database.feedback.findMany({
    select: { createdAt: true },
  });

  const config: AreaChartProperties["config"] = {
    feedback: {
      label: "Feedback",
      color: colors.violet,
    },
  };

  const today = new Date();
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return d.toLocaleString("default", { month: "long", year: "numeric" });
  }).reverse();

  const data = last12Months.map((month) => ({ month, count: 0 }));

  for (const item of feedback) {
    const itemMonth = item.createdAt.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const dataIndex = data.findIndex((d) => d.month === itemMonth);
    if (dataIndex !== -1) {
      data[dataIndex].count += 1;
    }
  }

  return (
    <StackCard className="p-0" icon={ChartAreaIcon} title="Incoming Feedback">
      <AreaChart
        axisKey="month"
        className="h-[20rem]"
        config={config}
        data={data}
        dataKey="count"
      />
    </StackCard>
  );
};
