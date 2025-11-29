"use client";

import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Select } from "@repo/design-system/components/precomposed/select";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@repo/design-system/components/ui/kibo-ui/dropzone";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { useState } from "react";
import { importMarkdown } from "@/actions/markdown/import";
import { parseMarkdown } from "@/actions/markdown/parse";

export const MarkdownImportForm = () => {
  const [results, setResults] = useState<
    {
      data: Record<string, unknown>;
      content: string;
      filename: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [titleField, setTitleField] = useState<string | undefined>(undefined);
  const [createdAtField, setCreatedAtField] = useState<string | undefined>(
    undefined
  );
  const [slugField, setSlugField] = useState<string | undefined>(undefined);
  const [tagsField, setTagsField] = useState<string | undefined>(undefined);

  const disabled = !titleField || results.length === 0 || loading;

  const handleDrop = async (files: File[]) => {
    if (loading || !files.length) {
      return;
    }

    setLoading(true);

    try {
      const promises = files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                const fileContent = event.target.result as string;
                resolve({
                  fileContent,
                  filename: file.name.split(".").slice(0, -1).join("."),
                });
              }
            };
            reader.readAsText(file);
          })
      );

      const raw = (await Promise.all(promises)) as {
        fileContent: string;
        filename: string;
      }[];

      const response = await parseMarkdown(raw);

      if ("error" in response) {
        throw new Error(response.error);
      }

      setResults(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldContent = (
    field: string | undefined,
    result: (typeof results)[number]
  ) => {
    if (!field) {
      return;
    }

    if (field === "filename") {
      return result.filename;
    }

    const fieldContent = result.data[field];

    if (!fieldContent) {
      return;
    }

    if (Array.isArray(fieldContent)) {
      return fieldContent.join(", ");
    }

    return `${fieldContent}`;
  };

  const handleImport = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    const changelogs = results.map((result) => ({
      title: getFieldContent(titleField, result),
      content: result.content,
      createdAt: getFieldContent(createdAtField, result),
      slug: getFieldContent(slugField, result),
      tags: getFieldContent(tagsField, result)?.split(", "),
    }));

    try {
      const response = await importMarkdown(changelogs);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success(`Successfully imported ${results.length} files`);
      setResults([]);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getCaption = (field: string | undefined) => {
    const examples = results.slice(0, 3);

    if (!(field && examples.length)) {
      return;
    }

    return examples
      .map((example) => getFieldContent(field, example))
      .filter(Boolean)
      .join(", ");
  };

  const fields = new Set<string>();
  for (const result of results) {
    for (const key of Object.keys(result.data)) {
      fields.add(key);
    }
  }

  const data = [
    ...Array.from(fields).map((field) => ({
      value: field,
      label: field,
    })),
    {
      value: "[none]",
      label: "None",
    },
    {
      value: "filename",
      label: "Filename",
    },
  ];

  const handleTitleFieldChange = (value: string) =>
    setTitleField(value === "[none]" ? undefined : value);

  const handleCreatedAtFieldChange = (value: string) =>
    setCreatedAtField(value === "[none]" ? undefined : value);

  const handleSlugFieldChange = (value: string) =>
    setSlugField(value === "[none]" ? undefined : value);

  const handleTagsFieldChange = (value: string) =>
    setTagsField(value === "[none]" ? undefined : value);

  return (
    <>
      <Dropzone
        accept={{ "text/markdown": [] }}
        className="rounded-none border-none"
        maxFiles={100}
        onDrop={handleDrop}
        onError={console.error}
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>

      <Dialog
        cta="Import"
        description="Let's import your Markdown files"
        disabled={disabled}
        modal={false}
        onClick={handleImport}
        onOpenChange={() => setResults([])}
        open={results.length > 0}
        title={`Import ${results.length} files`}
      >
        <Select
          caption={getCaption(titleField)}
          data={data}
          label="Choose a Title field"
          onChange={handleTitleFieldChange}
          type="field"
          value={titleField}
        />

        <Select
          caption={getCaption(createdAtField)}
          data={data}
          label="Choose a Created At field (optional)"
          onChange={handleCreatedAtFieldChange}
          type="field"
          value={createdAtField}
        />

        <Select
          caption={getCaption(slugField)}
          data={data}
          label="Choose a Slug field (optional)"
          onChange={handleSlugFieldChange}
          type="field"
          value={slugField}
        />

        <Select
          caption={getCaption(tagsField)}
          data={data}
          label="Choose a Tags field (optional)"
          onChange={handleTagsFieldChange}
          type="field"
          value={tagsField}
        />
      </Dialog>
    </>
  );
};
