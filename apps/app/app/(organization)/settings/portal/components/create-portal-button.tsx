'use client';

import { createPortal } from '@/actions/portal/create';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useState } from 'react';

export const CreatePortalButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCreatePortal = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await createPortal();

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCreatePortal} disabled={loading}>
      Create
    </Button>
  );
};
