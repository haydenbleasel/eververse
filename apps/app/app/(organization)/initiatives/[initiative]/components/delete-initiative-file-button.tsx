'use client';

import { deleteInitiativeFile } from '@/actions/initiative-file/delete';
import type { InitiativeFile } from '@prisma/client';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { XIcon } from 'lucide-react';
import { useState } from 'react';

type DeleteInitiativeFileButtonProperties = {
  readonly id: InitiativeFile['id'];
};

export const DeleteInitiativeFileButton = ({
  id,
}: DeleteInitiativeFileButtonProperties) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteInitiativeFile(id);

      if (error) {
        throw new Error(error);
      }

      toast.success('File deleted');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      title="Are you sure?"
      description="This action cannot be undone. The file will be permanently deleted."
      onClick={handleClick}
      disabled={loading}
      trigger={
        loading ? (
          <LoadingCircle dimensions="h-3 w-3" />
        ) : (
          <div className="h-3 w-3 shrink-0">
            <button type="button" className="block" disabled={loading}>
              <XIcon size={12} className="text-muted-foreground" />
            </button>
          </div>
        )
      }
    />
  );
};
