'use client';

import { sendInitiativeUpdate } from '@/actions/initiative-update/send';
import type { InitiativeUpdate } from '@prisma/client';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { SendIcon } from 'lucide-react';
import { useState } from 'react';

type InitiativeUpdateSendButtonProps = {
  updateId: InitiativeUpdate['id'];
  recipientCount: number;
};

export const InitiativeUpdateSendButton = ({
  updateId,
  recipientCount,
}: InitiativeUpdateSendButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSend = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await sendInitiativeUpdate(updateId);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Update sent.');
      setOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Send update"
      description={`Are you sure you want to send this update to ${recipientCount} recipients?`}
      cta="Send"
      onClick={handleSend}
      disabled={loading}
      trigger={
        <Button className="flex items-center gap-2">
          <SendIcon size={16} />
          Send
        </Button>
      }
    />
  );
};
