"use client";

import type { ApiKey } from "@repo/backend/prisma/client";
import { AlertDialog } from "@repo/design-system/components/precomposed/alert-dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { useState } from "react";
import { deleteAPIKey } from "@/actions/api-key/delete";

type DeleteApiKeyButtonProperties = {
  readonly id: ApiKey["id"];
};

export const DeleteAPIKeyButton = ({ id }: DeleteApiKeyButtonProperties) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteKey = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteAPIKey(id);

      if (error) {
        throw new Error(error);
      }

      toast.success("API key deleted");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      description="This action cannot be undone. This will permanently delete your API Key."
      disabled={loading}
      onClick={handleDeleteKey}
      title="Are you absolutely sure?"
      trigger={
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      }
    />
  );
};
