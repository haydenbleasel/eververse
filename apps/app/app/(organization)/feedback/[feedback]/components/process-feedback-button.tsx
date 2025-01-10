'use client';

import { updateFeedback } from '@/actions/feedback/update';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { CheckCircleIcon, UndoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ProcessFeedbackButtonProperties = {
  readonly feedbackId: string;
  readonly defaultValue?: boolean;
};

export const ProcessFeedbackButton = ({
  feedbackId,
  defaultValue,
}: ProcessFeedbackButtonProperties) => {
  const [processed, setProcessed] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    const originalProcessed = processed;

    try {
      const response = await updateFeedback(feedbackId, {
        processed: !processed,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      setProcessed(!processed);

      if (!originalProcessed) {
        if ('id' in response) {
          router.push(`/feedback/${response.id}`);
        } else {
          router.push('/feedback');
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (processed) {
    return (
      <Button
        className="flex items-center gap-2"
        disabled={loading}
        onClick={handleClick}
        variant="ghost"
        size="sm"
      >
        <UndoIcon size={16} className="text-muted-foreground" />
        <span>Mark feedback as unprocessed</span>
      </Button>
    );
  }

  return (
    <Button
      className="flex items-center gap-2"
      disabled={loading}
      onClick={handleClick}
      variant="ghost"
      size="sm"
    >
      <CheckCircleIcon size={16} className="text-success" />
      <span>Mark feedback as processed</span>
    </Button>
  );
};
