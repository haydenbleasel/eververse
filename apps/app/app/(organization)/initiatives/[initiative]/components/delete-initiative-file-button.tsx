"use client";

import type { InitiativeFile } from "@repo/backend/prisma/client";
import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { AlertDialog } from "@repo/design-system/components/precomposed/alert-dialog";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { deleteInitiativeFile } from "@/actions/initiative-file/delete";

type DeleteInitiativeFileButtonProperties = {
  readonly id: InitiativeFile["id"];
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

      toast.success("File deleted");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      description="This action cannot be undone. The file will be permanently deleted."
      disabled={loading}
      onClick={handleClick}
      title="Are you sure?"
      trigger={
        loading ? (
          <LoadingCircle dimensions="h-3 w-3" />
        ) : (
          <div className="h-3 w-3 shrink-0">
            <button className="block" disabled={loading} type="button">
              <XIcon className="text-muted-foreground" size={12} />
            </button>
          </div>
        )
      }
    />
  );
};
