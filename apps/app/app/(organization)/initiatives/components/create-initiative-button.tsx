"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useInitiativeForm } from "@/components/initiative-form/use-initiative-form";

export const CreateInitiativeButton = () => {
  const { show } = useInitiativeForm();
  const handleShow = () => show();

  return (
    <Button className="w-fit" onClick={handleShow}>
      Create initiative
    </Button>
  );
};
