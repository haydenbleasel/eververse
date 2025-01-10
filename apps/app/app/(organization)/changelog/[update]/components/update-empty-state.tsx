'use client';

import { generateChangelog } from '@/actions/changelog/generate';
import type { Changelog } from '@prisma/client';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { handleError } from '@repo/design-system/lib/handle-error';
import { PencilIcon, SparklesIcon } from 'lucide-react';
import { useState } from 'react';

type UpdateEmptyStateProperties = {
  changelogId: Changelog['id'];
  isSubscribed: boolean;
};

export const UpdateEmptyState = ({
  changelogId,
  isSubscribed,
}: UpdateEmptyStateProperties) => {
  const [loading, setLoading] = useState(false);
  const startTypes = [
    {
      id: 'ai',
      label: 'Generate with AI',
      description: isSubscribed
        ? 'Eververse will generate an update for you based on your roadmap.'
        : 'Upgrade to a paid plan to generate updates with AI.',
      icon: SparklesIcon,
      disabled: !isSubscribed || loading,
    },
    {
      id: 'scratch',
      label: 'Start from scratch',
      description: 'Write your own update from scratch, no AI involved.',
      icon: PencilIcon,
      disabled: loading,
    },
  ];

  const handleClick = async (id: string) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await generateChangelog(changelogId, id === 'ai');

      if ('error' in response) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingCircle />;
  }

  return (
    <div className="grid w-full grid-cols-2 gap-4">
      {startTypes.map((option) => (
        <button
          key={option.id}
          className="space-y-2 rounded border bg-background p-4 transition-colors hover:bg-card"
          onClick={() => handleClick(option.id)}
          type="button"
          disabled={option.disabled}
        >
          <option.icon
            size={24}
            className="pointer-events-none mx-auto select-none text-muted-foreground"
          />
          <span className="pointer-events-none mt-2 block select-none font-medium text-sm">
            {option.label}
          </span>
          <span className="pointer-events-none block select-none text-muted-foreground text-sm">
            {option.description}
          </span>
        </button>
      ))}
    </div>
  );
};
