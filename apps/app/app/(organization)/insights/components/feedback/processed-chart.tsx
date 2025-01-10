import { database } from '@/lib/database';
import {
  PieChart,
  type PieChartProperties,
} from '@repo/design-system/components/charts/pie';
import { StackCard } from '@repo/design-system/components/stack-card';
import { tailwind } from '@repo/tailwind-config';
import { EyeIcon } from 'lucide-react';

export const ProcessedChart = async () => {
  const feedback = await database.feedback.findMany({
    select: { processed: true },
  });

  const data: {
    status: string;
    count: number;
    fill: string;
  }[] = [
    {
      status: 'Processed',
      count: 0,
      fill: tailwind.theme.colors.emerald[500],
    },
    {
      status: 'Unprocessed',
      count: 0,
      fill: tailwind.theme.colors.gray[300],
    },
  ];

  const config: PieChartProperties['config'] = {};

  for (const feature of feedback) {
    if (feature.processed) {
      data[0].count += 1;
    } else {
      data[1].count += 1;
    }
  }

  return (
    <StackCard title="Processed Feedback" icon={EyeIcon}>
      <PieChart
        config={config}
        className="mx-auto h-80"
        data={data}
        dataKey="count"
        nameKey="status"
      />
    </StackCard>
  );
};
