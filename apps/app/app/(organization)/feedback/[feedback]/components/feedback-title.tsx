'use client';

import { updateFeedback } from '@/actions/feedback/update';
import { DocumentInput } from '@/components/document-input';
import type { Feedback } from '@prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';

type FeedbackTitleProperties = {
  readonly feedbackId: Feedback['id'];
  readonly defaultTitle: Feedback['title'];
  readonly editable: boolean;
};

export const FeedbackTitle = ({
  feedbackId,
  defaultTitle,
  editable,
}: FeedbackTitleProperties) => {
  const handleDebouncedUpdate = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await updateFeedback(feedbackId, { title: value });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <DocumentInput
      defaultValue={defaultTitle}
      onDebouncedUpdate={handleDebouncedUpdate}
      disabled={!editable}
    />
  );
};
