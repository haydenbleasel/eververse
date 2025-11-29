"use client";

import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTemplate } from "@/actions/template/create";

export const CreateTemplateButton = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const disabled = loading || !title.trim() || !description.trim();

  const handleSave = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const response = await createTemplate(title, description);

      if ("error" in response) {
        throw new Error(response.error);
      }

      setTitle("");
      setDescription("");
      setOpen(false);

      router.push(`/settings/templates/${response.id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      cta="Create template"
      description="A template is a reusable piece of content that can be used to create new feature requirements documents."
      disabled={disabled}
      onClick={handleSave}
      onOpenChange={setOpen}
      open={open}
      title="Create a new template"
      trigger={<Button variant="outline">Create template</Button>}
    >
      <Input
        autoComplete="off"
        label="Name"
        maxLength={191}
        onChangeText={setTitle}
        placeholder="My Template"
        required
        value={title}
      />
      <Input
        autoComplete="off"
        label="Description"
        maxLength={191}
        onChangeText={setDescription}
        placeholder="A brief description of the template"
        required
        value={description}
      />
    </Dialog>
  );
};
