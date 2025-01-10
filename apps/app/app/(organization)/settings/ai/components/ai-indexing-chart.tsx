import { database } from '@/lib/database';
import {
  RadialChart,
  type RadialChartProperties,
} from '@repo/design-system/components/charts/radial';
import { StackCard } from '@repo/design-system/components/stack-card';
import { tailwind } from '@repo/tailwind-config';
import { DatabaseIcon } from 'lucide-react';

export const AiIndexingChart = async () => {
  const [feedbacks, features] = await Promise.all([
    database.feedback.findMany({
      select: {
        analysis: {
          select: {
            id: true,
          },
        },
        aiSentiment: true,
      },
    }),
    database.feature.findMany({
      select: {
        aiRice: true,
      },
    }),
  ]);

  const totalFeedbacks = feedbacks.length;
  const totalFeatures = features.length;

  const aiSummaryCount = feedbacks.filter(
    (feedback) => feedback.analysis !== null
  ).length;
  const aiSentimentCount = feedbacks.filter(
    (feedback) => feedback.aiSentiment !== null
  ).length;
  const aiRiceFeatureCount = features.filter(
    (feature) => feature.aiRice !== null
  ).length;

  const aiSummaryPercentage = totalFeedbacks
    ? (aiSummaryCount / totalFeedbacks) * 100
    : 0;
  const aiSentimentPercentage = totalFeedbacks
    ? (aiSentimentCount / totalFeedbacks) * 100
    : 0;
  const aiRiceFeaturePercentage = totalFeatures
    ? (aiRiceFeatureCount / totalFeatures) * 100
    : 0;

  const config: RadialChartProperties['config'] = {
    value: {
      label: 'Indexed',
    },
    summarize: {
      label: 'AI Feedback Summarization',
      color: tailwind.theme.colors.amber[500],
    },
    sentiment: {
      label: 'AI Sentiment Analysis',
      color: tailwind.theme.colors.emerald[500],
    },
    rice: {
      label: 'AI RICE Score Estimation',
      color: tailwind.theme.colors.indigo[500],
    },
  };

  const data: RadialChartProperties['data'] = [
    {
      type: 'summarize',
      value: aiSummaryPercentage,
      fill: 'var(--color-summarize)',
    },
    {
      type: 'sentiment',
      value: aiSentimentPercentage,
      fill: 'var(--color-sentiment)',
    },
    { type: 'rice', value: aiRiceFeaturePercentage, fill: 'var(--color-rice)' },
  ];

  return (
    <StackCard icon={DatabaseIcon} title="AI Indexing">
      <RadialChart
        data={data}
        config={config}
        dataKey="value"
        nameKey="type"
        className="mx-auto h-80"
      />
    </StackCard>
  );
};
