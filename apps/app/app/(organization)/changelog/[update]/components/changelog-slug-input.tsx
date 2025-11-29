"use client";

import type { Changelog } from "@repo/backend/prisma/client";
import { Input } from "@repo/design-system/components/precomposed/input";
import { handleError } from "@repo/design-system/lib/handle-error";
import { slugifyLax } from "@repo/lib/slugify";
import { type ChangeEventHandler, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { updateChangelog } from "@/actions/changelog/update";

type ChangelogSlugInputProperties = {
  readonly changelogId: Changelog["id"];
  readonly defaultValue: Changelog["slug"];
  readonly disabled?: boolean;
};

export const ChangelogSlugInput = ({
  changelogId,
  defaultValue,
  disabled,
}: ChangelogSlugInputProperties) => {
  const [value, setValue] = useState<string>(defaultValue ?? "");
  const debouncedUpdates = useDebouncedCallback(async (value: string) => {
    if (!value) {
      return;
    }

    try {
      const response = await updateChangelog(changelogId, { slug: value });

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
    }
  }, 750);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newSlug = slugifyLax(event.target.value);

    debouncedUpdates(newSlug);
    setValue(newSlug);
  };

  return (
    <Input
      className="bg-background"
      disabled={disabled}
      onChange={handleChange}
      placeholder="a-custom-slug"
      value={value}
    />
  );
};
