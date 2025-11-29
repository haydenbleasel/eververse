import { createMetadata } from "@repo/seo/metadata";
import { MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { database } from "@/lib/database";

export const metadata: Metadata = createMetadata({
  title: "Feedback",
  description: "View and manage feedback.",
});

const FeedbackIndexPage = async () => {
  const feedback = await database.feedback.findFirst({
    where: { processed: false },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!feedback) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          description="No feedback has been provided yet. Check back later."
          icon={MessageCircleIcon}
          title="No feedback found"
        />
      </div>
    );
  }

  return redirect(`/feedback/${feedback.id}`);
};

export default FeedbackIndexPage;
