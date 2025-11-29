"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useFeedbackForm } from "@/components/feedback-form/use-feedback-form";

export const AddFeedbackButton = () => {
  const { show } = useFeedbackForm();
  const handleShow = () => show();

  return (
    <Button className="w-fit" onClick={handleShow}>
      Add feedback
    </Button>
  );
};
