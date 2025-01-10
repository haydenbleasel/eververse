'use client';

import { useFeedbackForm } from '@/components/feedback-form/use-feedback-form';
import { Button } from '@repo/design-system/components/ui/button';

export const AddFeedbackButton = () => {
  const { show } = useFeedbackForm();
  const handleShow = () => show();

  return (
    <Button onClick={handleShow} className="w-fit">
      Add feedback
    </Button>
  );
};
