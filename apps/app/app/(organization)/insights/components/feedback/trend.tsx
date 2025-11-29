import { database } from "@/lib/database";

export const FeedbackTrend = async () => {
  const feedback = await database.feedback.findMany({
    select: { aiSentiment: true },
  });

  const positive = feedback.filter(
    ({ aiSentiment }) => aiSentiment === "POSITIVE"
  ).length;
  const negative = feedback.filter(
    ({ aiSentiment }) => aiSentiment === "NEGATIVE"
  ).length;
  const angry = feedback.filter(
    ({ aiSentiment }) => aiSentiment === "ANGRY"
  ).length;

  let trend = "mostly neutral";

  if (positive > negative + angry) {
    trend = "up";
  } else if (positive < negative + angry) {
    trend = "down";
  }

  return (
    <p className="text-muted-foreground text-sm">
      Overall, your feedback is trending {trend}.
    </p>
  );
};
