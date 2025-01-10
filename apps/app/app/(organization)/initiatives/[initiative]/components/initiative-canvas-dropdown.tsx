'use client';
import { updateInitiativeCanvas } from '@/actions/initiative-canvas/update';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { DropdownMenu } from '@repo/design-system/components/precomposed/dropdown-menu';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';

type InitiativeCanvasDropdownProperties = {
  readonly canvasId: string;
  readonly defaultTitle: string;
};

export const InitiativeCanvasDropdown = ({
  canvasId,
  defaultTitle,
}: InitiativeCanvasDropdownProperties) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    setLoading(true);
    try {
      await updateInitiativeCanvas(canvasId, { title });

      setRenameOpen(false);
      toast.success('Canvas renamed');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu
          data={[{ onClick: () => setRenameOpen(true), children: 'Rename' }]}
        >
          <Button variant="secondary" size="icon">
            <MoreHorizontalIcon size={16} />
          </Button>
        </DropdownMenu>
      </div>
      <Dialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename canvas"
        description="What would you like to rename this canvas to?"
        onClick={handleRename}
        disabled={loading}
        cta="Rename"
      >
        <Input
          label="Canvas title"
          value={title}
          onChangeText={setTitle}
          placeholder="My new canvas"
          maxLength={191}
          autoComplete="off"
        />
      </Dialog>
    </>
  );
};
