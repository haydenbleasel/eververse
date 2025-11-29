"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useState } from "react";
import { createPortal } from "@/actions/portal/create";

export const CreatePortalButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCreatePortal = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await createPortal();

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={handleCreatePortal}>
      Create
    </Button>
  );
};
