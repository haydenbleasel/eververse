'use client';

import { createGitHubStatusMappings } from '@/actions/installation-status-mapping/github/create';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useState } from 'react';

export const CreateStatusMappingsButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCreateMappings = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await createGitHubStatusMappings();

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
    <Button onClick={handleCreateMappings} disabled={loading}>
      Create Status Mappings
    </Button>
  );
};
