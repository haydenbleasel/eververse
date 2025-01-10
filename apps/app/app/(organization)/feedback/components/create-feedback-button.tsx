'use client';

import { useFeedbackForm } from '@/components/feedback-form/use-feedback-form';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { PlusIcon } from 'lucide-react';

export const CreateFeedbackButton = () => {
  const { show } = useFeedbackForm();

  return (
    <Tooltip content="Create feedback" side="bottom" align="end">
      <Button variant="ghost" size="icon" onClick={show}>
        <PlusIcon size={16} />
      </Button>
    </Tooltip>
  );
};
