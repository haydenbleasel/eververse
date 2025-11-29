"use client";

import { Textarea } from "@repo/design-system/components/precomposed/textarea";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { updateOrganization } from "@/actions/organization/update";

type ProductDescriptionFormProperties = {
  readonly defaultValue: string;
};

export const ProductDescriptionForm = ({
  defaultValue,
}: ProductDescriptionFormProperties) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(defaultValue);
  const disabled = loading || !description.trim();

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateOrganization({
        productDescription: description,
      });

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
    <form className="w-full space-y-2" onSubmit={handleSubmit}>
      <Textarea
        className="max-h-[20rem] min-h-[10rem] resize-y bg-background"
        onChangeText={setDescription}
        placeholder="Eververse is a new standard for modern product management. It's a web application designed to help Product teams at SaaS companies explore problems, ideate solutions, prioritize features and plan your roadmap all in one place."
        value={description}
      />
      <Button disabled={disabled} type="submit">
        Save
      </Button>
    </form>
  );
};
