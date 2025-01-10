'use client';

import { useFeedbackForm } from '@/hooks/use-feedback-form';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Textarea } from '@repo/design-system/components/precomposed/textarea';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { useState } from 'react';
import { createFeedback } from '../(roadmap)/[featureId]/actions/create-feedback';
import { LoginForm } from './login-form';

type CreateIdeaFormProperties = {
  readonly slug: string;
  readonly orgName: string;
};

export const CreateIdeaForm = ({ slug, orgName }: CreateIdeaFormProperties) => {
  const [open, setOpen] = useState(false);
  const { email, name } = useFeedbackForm();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const disabled =
    !email.trim() || !name.trim() || feedback.trim().length < 10 || loading;

  const onClick = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await createFeedback({
        email,
        name,
        feedback,
        slug,
      });

      if (error) {
        throw new Error(error);
      }

      setFeedback('');
      toast.success('Idea submitted!');
      setOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!name.trim() || !email.trim()) {
    return <LoginForm />;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Submit a new idea"
      description={`What's on your mind? Share your ideas with ${orgName}!`}
      cta="Submit Feedback"
      onClick={onClick}
      disabled={disabled}
      trigger={<Button>Submit an idea</Button>}
    >
      <Textarea
        label="Feedback"
        value={feedback}
        onChangeText={setFeedback}
        className="max-h-[20rem] min-h-[10rem] bg-background"
        placeholder="What is your idea?"
        required
        caption="Write at least 10 characters!"
      />
    </Dialog>
  );
};
