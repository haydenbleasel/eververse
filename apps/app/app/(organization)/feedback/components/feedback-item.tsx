"use client";

import { Link } from "@repo/design-system/components/link";
import { Avatar } from "@repo/design-system/components/precomposed/avatar";
import { SentimentEmoji } from "@repo/design-system/components/sentiment-emoji";
import { cn } from "@repo/design-system/lib/utils";
import { formatDate } from "@repo/lib/format";
import { usePathname } from "next/navigation";
import type { GetFeedbackResponse } from "@/actions/feedback/get";

type FeedbackItemProperties = {
  readonly feedback: GetFeedbackResponse[number];
};

export const FeedbackItem = ({ feedback }: FeedbackItemProperties) => {
  const pathname = usePathname();
  const href = `/feedback/${feedback.id}`;
  const active = pathname === href;

  return (
    <Link
      className={cn(
        "group relative flex gap-4 bg-transparent p-3 transition-colors hover:bg-card",
        active && "bg-primary/10 text-primary"
      )}
      href={href}
    >
      <div className="relative">
        <Avatar
          fallback={feedback.feedbackUser?.name.slice(0, 2)}
          src={feedback.feedbackUser?.imageUrl}
        />
        {feedback.aiSentiment ? (
          <div className="-right-1 absolute top-4 text-xs">
            <SentimentEmoji value={feedback.aiSentiment} />
          </div>
        ) : null}
      </div>
      <div className="relative z-10 grid w-full gap-1">
        <div className="flex items-center justify-between gap-3 truncate">
          <p className="truncate font-medium text-sm transition-colors">
            {feedback.title}
          </p>
          <p
            className={cn(
              "shrink-0 font-medium text-muted-foreground text-sm transition-colors",
              active && "text-primary"
            )}
          >
            {formatDate(feedback.createdAt)}
          </p>
        </div>
        <p
          className={cn(
            "line-clamp-2 text-muted-foreground text-sm transition-colors",
            active && "text-primary"
          )}
        >
          {feedback.text}
        </p>
      </div>
    </Link>
  );
};
