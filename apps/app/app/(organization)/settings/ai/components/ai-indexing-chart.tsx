import {
  RadialChart,
  type RadialChartProperties,
} from "@repo/design-system/components/charts/radial";
import { StackCard } from "@repo/design-system/components/stack-card";
import { colors } from "@repo/design-system/lib/colors";
import { DatabaseIcon } from "lucide-react";
import { database } from "@/lib/database";

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

  const config: RadialChartProperties["config"] = {
    value: {
      label: "Indexed",
    },
    summarize: {
      label: "AI Feedback Summarization",
      color: colors.amber,
    },
    sentiment: {
      label: "AI Sentiment Analysis",
      color: colors.emerald,
    },
    rice: {
      label: "AI RICE Score Estimation",
      color: colors.indigo,
    },
  };

  const data: RadialChartProperties["data"] = [
    {
      type: "summarize",
      value: aiSummaryPercentage,
      fill: "var(--color-summarize)",
    },
    {
      type: "sentiment",
      value: aiSentimentPercentage,
      fill: "var(--color-sentiment)",
    },
    { type: "rice", value: aiRiceFeaturePercentage, fill: "var(--color-rice)" },
  ];

  return (
    <StackCard icon={DatabaseIcon} title="AI Indexing">
      <RadialChart
        className="mx-auto h-80"
        config={config}
        data={data}
        dataKey="value"
        nameKey="type"
      />
    </StackCard>
  );
};
