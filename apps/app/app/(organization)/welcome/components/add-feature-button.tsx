"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useFeatureForm } from "@/components/feature-form/use-feature-form";

export const AddFeatureButton = () => {
  const { show } = useFeatureForm();
  const handleShow = () => show();

  return (
    <Button className="w-fit" onClick={handleShow}>
      Add feature
    </Button>
  );
};
