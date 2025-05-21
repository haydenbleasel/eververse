'use client';

import { deleteInitiativeLink } from '@/actions/initiative-link/delete';
import type { InitiativeExternalLink } from '@repo/backend/prisma/client';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { XIcon } from 'lucide-react';
import { useState } from 'react';

type DeleteExternalInitiativeLinkButtonProperties = {
  readonly id: InitiativeExternalLink['id'];
};

export const DeleteExternalInitiativeLinkButton = ({
  id,
}: DeleteExternalInitiativeLinkButtonProperties) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteInitiativeLink(id);

      if (error) {
        throw new Error(error);
      }

      toast.success('Link deleted');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      title="Are you sure?"
      description="Don't worry, you can re-add this link at any time."
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
