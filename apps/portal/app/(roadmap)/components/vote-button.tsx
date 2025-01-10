'use client';

import { useFeedbackForm } from '@/hooks/use-feedback-form';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';
import { createVote } from '../actions/create-vote';

type VoteButtonProperties = {
  readonly portalFeatureId: string;
  readonly defaultVotes: number;
  readonly slug: string;
};

export const VoteButton = ({
  portalFeatureId,
  defaultVotes,
  slug,
}: VoteButtonProperties) => {
  const [loading, setLoading] = useState(false);
  const feedbackForm = useFeedbackForm();
  const authenticated = feedbackForm.email && feedbackForm.name;
  const [votes, setVotes] = useState(defaultVotes);

  const handleVote = async () => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      feedbackForm.setOpen(true);
      return;
    }

    setLoading(true);

    try {
      const { error } = await createVote({
        email: feedbackForm.email,
        name: feedbackForm.name,
        portalFeatureId,
        slug,
      });

      if (error) {
        throw new Error(error);
      }

      setVotes((previousVotes) => previousVotes + 1);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="flex h-full w-8 shrink-0 flex-col gap-0 p-1"
      onClick={handleVote}
    >
      <ChevronUpIcon
        size={12}
        className="group-hover:-translate-y-0.5 transition-transform"
      />
      <span className="block">{votes}</span>
    </Button>
  );
};
