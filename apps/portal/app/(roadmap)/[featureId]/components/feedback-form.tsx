'use client';

import { LoginForm } from '@/app/components/login-form';
import { useFeedbackForm } from '@/hooks/use-feedback-form';
import { Textarea } from '@repo/design-system/components/precomposed/textarea';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { createFeedback } from '../actions/create-feedback';

type FeedbackFormProperties = {
  readonly featureId: string;
  readonly slug: string;
};

export const FeedbackForm = ({ featureId, slug }: FeedbackFormProperties) => {
  const feedbackForm = useFeedbackForm();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const authenticated = feedbackForm.email && feedbackForm.name;
  const disabled = !authenticated || feedback.trim().length < 10 || loading;

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await createFeedback({
        email: feedbackForm.email,
        name: feedbackForm.name,
        feedback,
        featureId,
        slug,
      });

      if (error) {
        throw new Error(error);
      }

      setFeedback('');
      toast.success('Feedback submitted!');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="w-full space-y-4 rounded-lg border bg-background p-4">
        <LoginForm />
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full space-y-4 rounded-lg border bg-background p-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          value={feedback}
          onChangeText={setFeedback}
          className="max-h-[20rem] min-h-[10rem] bg-background"
          placeholder="I need this feature because..."
          required
        />
        <small className="text-muted-foreground">
          Write at least 10 characters!
        </small>
      </div>
      <Button type="submit" disabled={disabled}>
        Submit Feedback
      </Button>
    </form>
  );
};
