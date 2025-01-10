'use client';

import { updateFeature } from '@/actions/feature/update';
import type { Feature } from '@prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { useState } from 'react';

type FeatureClearDateButtonProps = {
  featureId: Feature['id'];
};

export const FeatureClearDateButton = ({
  featureId,
}: FeatureClearDateButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClear = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await updateFeature(featureId, {
        startAt: null,
        endAt: null,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Date cleared');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="h-auto p-0 text-destructive"
      variant="ghost"
      size="sm"
      onClick={handleClear}
    >
      Clear
    </Button>
  );
};
