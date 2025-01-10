'use client';

import { EmptyState } from '@/components/empty-state';
import { useFeedbackForm } from '@/components/feedback-form/use-feedback-form';
import { emptyStates } from '@/lib/empty-states';
import { Button } from '@repo/design-system/components/ui/button';

export const FeedbackEmptyState = () => {
  const { show } = useFeedbackForm();

  const handleShow = () => show();

  return (
    <EmptyState {...emptyStates.feedback}>
      <Button onClick={handleShow} className="w-fit">
        Add feedback
      </Button>
    </EmptyState>
  );
};
