"use client";

import type { User } from "@repo/backend/auth";
import type { Group, Product } from "@repo/backend/prisma/client";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { handleError } from "@repo/design-system/lib/handle-error";
import { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { KeyboardEventHandler } from "react";
import { useState } from "react";
import { createFeature } from "@/actions/feature/create";
import { nestGroups } from "@/lib/group";
import { FeatureAssigneePicker } from "./feature-assignee-picker";
import { FeatureGroupPicker } from "./feature-group-picker";
import { FeatureProductPicker } from "./feature-product-picker";
import { useFeatureForm } from "./use-feature-form";

type FeatureFormProperties = {
  readonly userId: User["id"];
  readonly members: User[];
  readonly products: Pick<Product, "emoji" | "id" | "name">[];
  readonly groups: Pick<
    Group,
    "emoji" | "id" | "name" | "parentGroupId" | "productId"
  >[];
};

export const FeatureForm = ({
  members,
  products,
  groups,
  userId,
}: FeatureFormProperties) => {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(userId);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const disabled = !title.trim() || loading;
  const {
    isOpen,
    setOpen,
    hide,
    groupId,
    productId,
    setGroupId,
    setProductId,
  } = useFeatureForm();
  const queryClient = new QueryClient();

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      onClick();
    }
  };

  const onClick = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const response = await createFeature({
        title,
        assignee,
        productId,
        groupId,
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      setTitle("");
      setAssignee(userId);
      setProductId(undefined);
      setGroupId(undefined);

      hide();

      router.push(`/features/${response.id}`);

      await queryClient.invalidateQueries({
        queryKey: ["features"],
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const relevantGroups = groups.filter(
    (group) => group.productId === productId
  );

  const handleProductChange = (newValue: string) => {
    setProductId(newValue);
    setGroupId(undefined);
  };

  return (
    <Dialog
      className="max-w-3xl"
      cta="Create feature"
      disabled={disabled}
      footer={
        <div className="flex items-center gap-3">
          <FeatureAssigneePicker
            data={members}
            onChange={setAssignee}
            value={assignee}
          />
          {products.length > 0 ? (
            <FeatureProductPicker
              data={products}
              onChange={handleProductChange}
              value={productId}
            />
          ) : null}
          {productId && relevantGroups.length > 0 ? (
            <FeatureGroupPicker
              data={nestGroups(relevantGroups)}
              onChange={setGroupId}
              value={groupId}
            />
          ) : null}
        </div>
      }
      modal={false}
      onClick={onClick}
      onOpenChange={setOpen}
      open={isOpen}
      title={
        <p className="font-medium text-muted-foreground text-sm tracking-tight">
          Create a feature
        </p>
      }
    >
      <Input
        autoComplete="off"
        className="border-none p-0 font-medium shadow-none focus-visible:ring-0 md:text-lg"
        maxLength={191}
        onChangeText={setTitle}
        onKeyDown={handleKeyDown}
        placeholder="Add ability to customize dashboard"
        value={title}
      />
    </Dialog>
  );
};
