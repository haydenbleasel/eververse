'use client';

import { deleteAPIKey } from '@/actions/api-key/delete';
import type { ApiKey } from '@repo/backend/prisma/client';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { useState } from 'react';

type DeleteApiKeyButtonProperties = {
  readonly id: ApiKey['id'];
};

export const DeleteAPIKeyButton = ({ id }: DeleteApiKeyButtonProperties) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteKey = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteAPIKey(id);

      if (error) {
        throw new Error(error);
      }

      toast.success('API key deleted');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      title="Are you absolutely sure?"
      description="This action cannot be undone. This will permanently delete your API Key."
      onClick={handleDeleteKey}
      disabled={loading}
      trigger={
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      }
    />
  );
};
