"use client";

import type { InitiativeExternalLink } from "@repo/backend/prisma/client";
import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { AlertDialog } from "@repo/design-system/components/precomposed/alert-dialog";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { deleteInitiativeLink } from "@/actions/initiative-link/delete";

type DeleteExternalInitiativeLinkButtonProperties = {
  readonly id: InitiativeExternalLink["id"];
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

      toast.success("Link deleted");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      description="Don't worry, you can re-add this link at any time."
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
