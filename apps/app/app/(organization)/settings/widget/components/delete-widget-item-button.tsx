import { deleteWidgetItem } from '@/actions/widget-item/delete';
import type { WidgetItem } from '@repo/backend/prisma/client';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';

type DeleteWidgetItemButtonProperties = {
  readonly data: WidgetItem;
};

export const DeleteWidgetItemButton = ({
  data,
}: DeleteWidgetItemButtonProperties) => {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await deleteWidgetItem(data.id);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Widget item deleted');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      title="Are you absolutely sure?"
      description={`This action cannot be undone. This will permanently delete the item ${data.name}.`}
      onClick={onClick}
      disabled={loading}
      trigger={
        <Tooltip content="Delete">
          <Button size="icon" variant="ghost">
            <TrashIcon size={16} className="text-destructive" />
          </Button>
        </Tooltip>
      }
    />
  );
};
