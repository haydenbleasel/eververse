"use client";

import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { handleError } from "@repo/design-system/lib/handle-error";
import { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { KeyboardEventHandler } from "react";
import { useState } from "react";
import { createChangelog } from "@/actions/changelog/create";
import { useChangelogForm } from "./use-changelog-form";

export const ChangelogForm = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const disabled = !name.trim() || loading;
  const { isOpen, toggle, hide } = useChangelogForm();
  const queryClient = new QueryClient();

  const handleCreate = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { id, error } = await createChangelog(name);

      if (error) {
        throw new Error(error);
      }

      if (!id) {
        throw new Error("Something went wrong");
      }

      setName("");

      hide();

      await queryClient.invalidateQueries({ queryKey: ["changelog"] });

      router.push(`/changelog/${id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog
      className="sm:max-w-2xl"
      cta="Create product update"
      disabled={disabled}
      modal={false}
      onClick={handleCreate}
      onOpenChange={toggle}
      open={isOpen}
      title={
        <p className="font-medium text-muted-foreground text-sm tracking-tight">
          Create a product update
        </p>
      }
    >
      <Input
        autoComplete="off"
        className="border-none p-0 font-medium shadow-none focus-visible:ring-0 md:text-lg"
        maxLength={191}
        onChangeText={setName}
        onKeyDown={handleKeyDown}
        placeholder="Product update 1.1"
        value={name}
      />
    </Dialog>
  );
};
