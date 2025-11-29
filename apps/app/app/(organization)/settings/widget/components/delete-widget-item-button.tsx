import type { WidgetItem } from "@repo/backend/prisma/client";
import { AlertDialog } from "@repo/design-system/components/precomposed/alert-dialog";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { deleteWidgetItem } from "@/actions/widget-item/delete";

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

      toast.success("Widget item deleted");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      description={`This action cannot be undone. This will permanently delete the item ${data.name}.`}
      disabled={loading}
      onClick={onClick}
      title="Are you absolutely sure?"
      trigger={
        <Tooltip content="Delete">
          <Button size="icon" variant="ghost">
            <TrashIcon className="text-destructive" size={16} />
          </Button>
        </Tooltip>
      }
    />
  );
};
