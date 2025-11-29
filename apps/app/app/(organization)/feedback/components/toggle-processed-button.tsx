"use client";

import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Toggle } from "@repo/design-system/components/ui/toggle";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useFeedbackOptions } from "@/hooks/use-feedback-options";

export const ToggleProcessedButton = () => {
  const { showProcessed, toggleShowProcessed } = useFeedbackOptions();
  const Icon = showProcessed ? EyeIcon : EyeOffIcon;

  return (
    <Tooltip
      align="end"
      content={
        showProcessed ? "Hide processed feedback" : "Show processed feedback"
      }
      side="bottom"
    >
      <Toggle
        className="!bg-transparent"
        onPressedChange={toggleShowProcessed}
        pressed={showProcessed}
      >
        <Icon className="text-muted-foreground" size={16} />
      </Toggle>
    </Tooltip>
  );
};
