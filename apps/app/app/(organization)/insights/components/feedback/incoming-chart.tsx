import { database } from '@/lib/database';
import {
  AreaChart,
  type AreaChartProperties,
} from '@repo/design-system/components/charts/area';
import { StackCard } from '@repo/design-system/components/stack-card';
import { tailwind } from '@repo/tailwind-config';
import { ChartAreaIcon } from 'lucide-react';

export const IncomingChart = async () => {
  const feedback = await database.feedback.findMany({
    select: { createdAt: true },
  });

  const config: AreaChartProperties['config'] = {
    feedback: {
      label: 'Feedback',
      color: tailwind.theme.colors.violet[500],
    },
  };

  const today = new Date();
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }).reverse();

  const data = last12Months.map((month) => ({ month, count: 0 }));

  for (const item of feedback) {
    const itemMonth = item.createdAt.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    const dataIndex = data.findIndex((d) => d.month === itemMonth);
    if (dataIndex !== -1) {
      data[dataIndex].count += 1;
    }
  }

  return (
    <StackCard title="Incoming Feedback" icon={ChartAreaIcon} className="p-0">
      <AreaChart
        config={config}
        className="h-[20rem]"
        data={data}
        axisKey="month"
        dataKey="count"
      />
    </StackCard>
  );
};
