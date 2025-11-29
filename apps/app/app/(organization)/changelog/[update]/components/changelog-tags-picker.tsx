"use client";

import type { Changelog, ChangelogTag } from "@repo/backend/prisma/client";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { addChangelogTag } from "@/actions/changelog-tag/connect";
import { createChangelogTag } from "@/actions/changelog-tag/create";
import { removeChangelogTag } from "@/actions/changelog-tag/disconnect";

type ChangelogTagsPickerProperties = {
  readonly changelogId: Changelog["id"];
  readonly storedTags: ChangelogTag[];
  readonly defaultTags: string[];
};

export const ChangelogTagsPicker = ({
  changelogId,
  storedTags,
  defaultTags,
}: ChangelogTagsPickerProperties) => {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [loading, setLoading] = useState(false);

  const handleCreateTag = async (name: string) => {
    setLoading(true);

    try {
      const response = await createChangelogTag({
        changelogId,
        name,
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      setTags((previous) => [...previous, response.id]);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (changelogTagId: string) => {
    setTags((previous) => [...previous, changelogTagId]);
    setLoading(true);

    try {
      const response = await addChangelogTag({
        changelogId,
        changelogTagId,
      });

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      setTags((previous) => previous.filter((id) => id !== changelogTagId));
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    setTags((previous) => previous.filter((id) => id !== tag));
    setLoading(true);

    try {
      const { error } = await removeChangelogTag({
        changelogId,
        changelogTagId: tag,
      });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      setTags((previous) => [...previous, tag]);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (tag: string) => {
    await (tags.includes(tag) ? handleRemoveTag(tag) : handleAddTag(tag));
  };

  return (
    <Select
      data={storedTags.map((tag) => ({
        label: tag.name,
        value: tag.id,
      }))}
      disabled={loading}
      exactSearch
      onChange={handleSelect}
      onCreate={handleCreateTag}
      trigger={
        <div>
          <Tooltip content="Add a new tag">
            <Button className="-m-1.5 h-6 w-6" size="icon" variant="ghost">
              <PlusIcon size={16} />
              <span className="sr-only">Add a new tag</span>
            </Button>
          </Tooltip>
        </div>
      }
      type="tag"
      value={tags}
    />
  );
};
