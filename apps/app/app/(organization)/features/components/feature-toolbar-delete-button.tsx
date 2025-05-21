import { deleteFeatures } from '@/actions/feature/bulk/delete';
import type { Feature } from '@repo/backend/prisma/client';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { QueryClient } from '@tanstack/react-query';
import { useState } from 'react';

type FeatureToolbarDeleteButtonProperties = {
  readonly selected: Feature['id'][];
  readonly onClose: () => void;
};

export const FeatureToolbarDeleteButton = ({
  selected,
  onClose,
}: FeatureToolbarDeleteButtonProperties) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = new QueryClient();

  const handleDelete = async () => {
    if (loading || selected.length === 0) {
      return;
    }

    setOpen(false);
    setLoading(true);

    try {
      const response = await deleteFeatures(selected);

      if (response.error) {
        throw new Error(response.error);
      }

      onClose();
      setOpen(false);
      toast.success('Features deleted successfully!');

      await queryClient.invalidateQueries({
        queryKey: ['features'],
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
      title="Are you absolutely sure?"
      description="This action cannot be undone. This will permanently the selected features."
      onClick={handleDelete}
      disabled={loading}
      trigger={
        <Button variant="destructive" disabled={loading} className="shrink-0">
          Delete
        </Button>
      }
    />
  );
};
