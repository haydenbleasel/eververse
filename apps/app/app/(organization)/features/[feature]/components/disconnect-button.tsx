"use client";

import type { FeatureConnection } from "@repo/backend/prisma/client";
import { AlertDialog } from "@repo/design-system/components/precomposed/alert-dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { useState } from "react";
import { disconnectFeature } from "@/actions/feature-connection/delete";

type DisconnectButtonProperties = {
  readonly connectionId: FeatureConnection["id"];
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

      toast.success("Feature disconnected.");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog
      cta="Disconnect"
      description="This will disconnect the feature from the connected service."
      disabled={loading}
      onClick={handleDisconnect}
      onOpenChange={setOpen}
      open={open}
      title="Are you sure?"
      trigger={
        <Button className="w-full" variant="link">
          Disconnect
        </Button>
      }
    />
  );
};
