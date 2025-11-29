"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useFeedbackForm } from "@/components/feedback-form/use-feedback-form";
import { emptyStates } from "@/lib/empty-states";

export const FeedbackEmptyState = () => {
  const { show } = useFeedbackForm();

  const handleShow = () => show();

  return (
    <EmptyState {...emptyStates.feedback}>
      <Button className="w-fit" onClick={handleShow}>
        Add feedback
      </Button>
    </EmptyState>
  );
};
