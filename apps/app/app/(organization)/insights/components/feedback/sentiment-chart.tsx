import { database } from '@/lib/database';
import {
  RadarChart,
  type RadarChartProperties,
} from '@repo/design-system/components/charts/radar';
import { StackCard } from '@repo/design-system/components/stack-card';
import { colors } from '@repo/design-system/lib/colors';
import { SmileIcon } from 'lucide-react';

export const SentimentChart = async () => {
  const feedback = await database.feedback.findMany({
    select: { aiSentiment: true },
  });

  const positive = feedback.filter(
    ({ aiSentiment }) => aiSentiment === 'POSITIVE'
  ).length;
  const neutral = feedback.filter(
    ({ aiSentiment }) => aiSentiment === 'NEUTRAL'
  ).length;
  const negative = feedback.filter(
    ({ aiSentiment }) => aiSentiment === 'NEGATIVE'
  ).length;
  const angry = feedback.filter(
    ({ aiSentiment }) => aiSentiment === 'ANGRY'
  ).length;
  const confused = feedback.filter(
    ({ aiSentiment }) => aiSentiment === 'CONFUSED'
  ).length;
  const informative = feedback.filter(
    ({ aiSentiment }) => aiSentiment === 'INFORMATIVE'
  ).length;

  const data: RadarChartProperties['data'] = [
    {
      sentiment: 'Positive',
      value: positive,
    },
    {
      sentiment: 'Neutral',
      value: neutral,
    },
    {
      sentiment: 'Negative',
      value: negative,
    },
    {
      sentiment: 'Angry',
      value: angry,
    },
    {
      sentiment: 'Confused',
      value: confused,
    },
    {
      sentiment: 'Informative',
      value: informative,
    },
  ];

  const config: RadarChartProperties['config'] = {
    value: {
      label: 'Feedback',
      color: colors.violet,
    },
  };

  return (
    <StackCard title="Sentiment" icon={SmileIcon}>
      <RadarChart
        data={data}
        dataKey="value"
        axisKey="sentiment"
        config={config}
        className="mx-auto h-full max-h-[20rem] w-full"
      />
    </StackCard>
  );
};
