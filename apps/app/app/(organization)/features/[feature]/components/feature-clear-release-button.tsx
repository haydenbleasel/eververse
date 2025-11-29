"use client";

import type { Feature } from "@repo/backend/prisma/client";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { useState } from "react";
import { updateFeature } from "@/actions/feature/update";

type FeatureClearReleaseButtonProps = {
  featureId: Feature["id"];
};

export const FeatureClearReleaseButton = ({
  featureId,
}: FeatureClearReleaseButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClear = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await updateFeature(featureId, {
        releaseId: null,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Release cleared");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="h-auto p-0 text-destructive"
      onClick={handleClear}
      size="sm"
      variant="ghost"
    >
      Clear
    </Button>
  );
};
