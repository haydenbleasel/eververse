'use client';

import { disconnectFeature } from '@/actions/feature-connection/delete';
import type { FeatureConnection } from '@prisma/client';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { useState } from 'react';

type DisconnectButtonProperties = {
  readonly connectionId: FeatureConnection['id'];
};

export const DisconnectButton = ({
  connectionId,
}: DisconnectButtonProperties) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDisconnect = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await disconnectFeature(connectionId);

      if (error) {
        throw new Error(error);
      }

      toast.success('Feature disconnected.');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
      title="Are you sure?"
      description="This will disconnect the feature from the connected service."
      cta="Disconnect"
      onClick={handleDisconnect}
      disabled={loading}
      trigger={
        <Button variant="link" className="w-full">
          Disconnect
        </Button>
      }
    />
  );
};
