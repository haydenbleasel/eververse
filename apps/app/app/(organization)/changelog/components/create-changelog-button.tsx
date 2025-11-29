"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useChangelogForm } from "@/components/changelog-form/use-changelog-form";

export const CreateChangelogButton = () => {
  const { show } = useChangelogForm();

  return (
    <Button onClick={show} size="icon" variant="ghost">
      <PlusIcon size={16} />
    </Button>
  );
};
