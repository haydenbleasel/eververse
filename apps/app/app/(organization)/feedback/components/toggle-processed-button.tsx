'use client';

import { useFeedbackOptions } from '@/hooks/use-feedback-options';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Toggle } from '@repo/design-system/components/ui/toggle';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export const ToggleProcessedButton = () => {
  const { showProcessed, toggleShowProcessed } = useFeedbackOptions();
  const Icon = showProcessed ? EyeIcon : EyeOffIcon;

  return (
    <Tooltip
      content={
        showProcessed ? 'Hide processed feedback' : 'Show processed feedback'
      }
      side="bottom"
      align="end"
    >
      <Toggle
        pressed={showProcessed}
        onPressedChange={toggleShowProcessed}
        className="!bg-transparent"
      >
        <Icon size={16} className="text-muted-foreground" />
      </Toggle>
    </Tooltip>
  );
};
