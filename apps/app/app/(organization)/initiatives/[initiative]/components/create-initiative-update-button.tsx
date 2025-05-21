'use client';

import { createInitiativeUpdate } from '@/actions/initiative-update/create';
import type { Initiative } from '@repo/backend/prisma/client';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { SendIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type CreateInitiativeUpdateButtonProps = {
  initiativeId: Initiative['id'];
  initiativeTitle: Initiative['title'];
};

export const CreateInitiativeUpdateButton = ({
  initiativeId,
  initiativeTitle,
}: CreateInitiativeUpdateButtonProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(
    `${initiativeTitle} - Update ${new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
    }).format(new Date())}`
  );
  const router = useRouter();
  const date = new Date();
  const [loading, setLoading] = useState(false);
  const disabled = loading || !title.trim();

  const handleSubmit = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const response = await createInitiativeUpdate(initiativeId, { title });

      if (response.error) {
        throw new Error(response.error);
      }

      router.push(`/initiatives/${initiativeId}/updates/${response.id}`);
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
      title="Create new update"
      description="Create a new update for this initiative"
      cta="Create update"
      disabled={disabled}
      onClick={handleSubmit}
      trigger={
        <Button variant="outline" className="flex items-center gap-2">
          <SendIcon size={16} />
          Send update
        </Button>
      }
    >
      <Input
        value={title}
        onChangeText={setTitle}
        placeholder={`Update ${date.toLocaleDateString()}`}
      />
    </Dialog>
  );
};
