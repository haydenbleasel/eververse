"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useState } from "react";
import { createGitHubStatusMappings } from "@/actions/installation-status-mapping/github/create";

export const CreateStatusMappingsButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCreateMappings = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await createGitHubStatusMappings();

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
    <Button disabled={loading} onClick={handleCreateMappings}>
      Create Status Mappings
    </Button>
  );
};
