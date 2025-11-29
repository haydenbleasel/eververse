import { Skeleton } from "@repo/design-system/components/precomposed/skeleton";
import { Suspense } from "react";
import { FeedbackEmptyState } from "@/app/(organization)/feedback/components/feedback-empty-state";
import { database } from "@/lib/database";
import { IncomingChart } from "./incoming-chart";
import { ProcessedChart } from "./processed-chart";
import { SentimentChart } from "./sentiment-chart";
import { FeedbackTrend } from "./trend";

export const FeedbackSection = async () => {
  const feedbackCount = await database.feedback.count();

  if (!feedbackCount) {
    return (
      <div className="p-16">
        <FeedbackEmptyState />
      </div>
    );
  }

  return (
    <section className="space-y-4 p-4 sm:p-8">
      <div>
        <p className="font-medium text-sm">Feedback</p>
        <Suspense fallback={<Skeleton className="h-5 w-64" />}>
          <FeedbackTrend />
        </Suspense>
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[391px] w-full" />}>
          <SentimentChart />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[391px] w-full" />}>
          <ProcessedChart />
        </Suspense>
        <div className="sm:col-span-2">
          <Suspense fallback={<Skeleton className="h-[367px] w-full" />}>
            <IncomingChart />
          </Suspense>
        </div>
      </div>
    </section>
  );
};
