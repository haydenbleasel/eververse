"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useReleaseForm } from "@/components/release-form/use-release-form";

export const CreateReleaseButton = () => {
  const releaseForm = useReleaseForm();

  return (
    <Button onClick={releaseForm.show} variant="outline">
      Create a release
    </Button>
  );
};
