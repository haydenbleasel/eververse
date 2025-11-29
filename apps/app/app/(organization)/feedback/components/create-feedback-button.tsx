"use client";

import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useFeedbackForm } from "@/components/feedback-form/use-feedback-form";

export const CreateFeedbackButton = () => {
  const { show } = useFeedbackForm();

  return (
    <Tooltip align="end" content="Create feedback" side="bottom">
      <Button onClick={show} size="icon" variant="ghost">
        <PlusIcon size={16} />
      </Button>
    </Tooltip>
  );
};
