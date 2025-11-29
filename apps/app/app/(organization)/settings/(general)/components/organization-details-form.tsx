"use client";

import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { updateOrganization } from "@/actions/organization/update";

type OrganizationDetailsFormProperties = {
  readonly defaultName: string;
  readonly defaultSlug: string;
};

export const OrganizationDetailsForm = ({
  defaultName,
  defaultSlug,
}: OrganizationDetailsFormProperties) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug);
  const disabled = loading || !name.trim() || !slug.trim();

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateOrganization({
        name,
        // slug,
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
    <form className="w-full space-y-4" onSubmit={handleSubmit}>
      <Input
        className="bg-background"
        label="Name"
        onChangeText={setName}
        placeholder="Eververse"
        value={name}
      />
      <Input
        className="bg-background"
        disabled
        label="Slug"
        onChangeText={setSlug}
        placeholder="eververse"
        value={slug}
      />
      <Button disabled={disabled} type="submit">
        Save
      </Button>
    </form>
  );
};
