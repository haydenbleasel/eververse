"use client";

import type { User } from "@repo/backend/auth";
import { EmojiSelector } from "@repo/design-system/components/emoji-selector";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useRouter } from "next/navigation";
import type { KeyboardEventHandler } from "react";
import { useState } from "react";
import { createInitiative } from "@/actions/initiative/create";
import { FeatureAssigneePicker } from "../feature-form/feature-assignee-picker";
import { useInitiativeForm } from "./use-initiative-form";

type InitiativeFormProperties = {
  readonly members: User[];
  readonly userId: string;
};

export const InitiativeForm = ({
  members,
  userId,
}: InitiativeFormProperties) => {
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState(userId);
  const [loading, setLoading] = useState(false);
  const [emoji, setEmoji] = useState("rocket");
  const router = useRouter();
  const disabled = !(name.trim() && ownerId) || loading;
  const { isOpen, toggle, hide } = useInitiativeForm();

  const handleCreate = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { id, error } = await createInitiative(name, emoji, ownerId);

      if (error) {
        throw new Error(error);
      }

      if (!id) {
        throw new Error("Something went wrong");
      }

      setName("");
      hide();
      router.push(`/initiatives/${id}`);
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
      cta="Create initiative"
      disabled={disabled}
      footer={
        <FeatureAssigneePicker
          data={members}
          onChange={setOwnerId}
          value={ownerId}
        />
      }
      modal={false}
      onClick={handleCreate}
      onOpenChange={toggle}
      open={isOpen}
      title={
        <p className="font-medium text-muted-foreground text-sm tracking-tight">
          Create an initiative
        </p>
      }
    >
      <div className="flex w-full gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-card">
          <EmojiSelector
            onChange={setEmoji}
            onError={handleError}
            value={emoji}
          />
        </div>
        <Input
          autoComplete="off"
          className="border-none p-0 font-medium shadow-none focus-visible:ring-0 md:text-lg"
          maxLength={191}
          onChangeText={setName}
          onKeyDown={handleKeyDown}
          placeholder="Improve the onboarding experience"
          value={name}
        />
      </div>
    </Dialog>
  );
};
