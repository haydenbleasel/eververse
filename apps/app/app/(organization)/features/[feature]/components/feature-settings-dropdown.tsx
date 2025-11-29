"use client";

import type { Feature, Template } from "@repo/backend/prisma/client";
import { AlertDialog } from "@repo/design-system/components/precomposed/alert-dialog";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { DropdownMenu } from "@repo/design-system/components/precomposed/dropdown-menu";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { QueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { deleteFeature } from "@/actions/feature/delete";
import { createTemplateFromFeature } from "@/actions/template/create";
import { updateTemplateFromFeature } from "@/actions/template/update";
import { OrDivider } from "@/components/or-divider";

type FeatureSettingsDropdownProperties = {
  readonly featureId: Feature["id"];
  readonly templates: Pick<Template, "id" | "title">[];
};

export const FeatureSettingsDropdown = ({
  featureId,
  templates,
}: FeatureSettingsDropdownProperties) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [existingTemplateId, setExistingTemplateId] = useState<
    Template["id"] | undefined
  >();
  const queryClient = new QueryClient();
  const router = useRouter();

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteFeature(featureId);

      if (error) {
        throw new Error(error);
      }

      setDeleteOpen(false);
      router.push("/features");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (loading || !templateName.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await createTemplateFromFeature(
        featureId,
        templateName,
        templateDescription
      );

      if ("error" in response) {
        throw new Error(response.error);
      }

      await queryClient.invalidateQueries({
        queryKey: ["templates"],
      });

      toast.success("Template created successfully");
      setSaveTemplateOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (loading || !existingTemplateId) {
      return;
    }

    setSaveTemplateOpen(false);
    setLoading(true);

    try {
      await updateTemplateFromFeature(existingTemplateId, featureId);

      await queryClient.invalidateQueries({
        queryKey: ["templates"],
      });

      toast.success("Template updated successfully");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute top-2 right-2">
        <DropdownMenu
          data={[
            {
              onClick: () => setDeleteOpen(true),
              disabled: loading,
              children: "Delete",
            },
            {
              onClick: () => setSaveTemplateOpen(true),
              disabled: loading,
              children: "Save as Template",
            },
          ]}
        >
          <Tooltip align="end" content="Settings" side="bottom">
            <Button size="icon" variant="ghost">
              <MoreHorizontalIcon size={16} />
            </Button>
          </Tooltip>
        </DropdownMenu>
      </div>

      <AlertDialog
        description="This action cannot be undone. This will permanently delete this feature."
        disabled={loading}
        onClick={handleDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        title="Are you absolutely sure?"
      />

      <Dialog
        description="Save this feature's content as a template for future use."
        disabled={loading || !templateName.trim()}
        onOpenChange={setSaveTemplateOpen}
        open={saveTemplateOpen}
        title="Save as Template"
      >
        <form className="space-y-4" onSubmit={handleSaveTemplate}>
          <Input
            autoComplete="off"
            label="Title"
            maxLength={191}
            onChangeText={setTemplateName}
            placeholder="My Template"
            required
            value={templateName}
          />

          <Input
            autoComplete="off"
            label="Description"
            maxLength={191}
            onChangeText={setTemplateDescription}
            placeholder="A brief description of the template"
            value={templateDescription}
          />

          <Button disabled={loading || !templateName.trim()} type="submit">
            Save as Template
          </Button>
        </form>

        {templates.length > 0 ? (
          <>
            <OrDivider />
            <form
              className="flex items-center gap-2"
              onSubmit={handleUpdateTemplate}
            >
              <Select
                data={templates.map((template) => ({
                  label: template.title,
                  value: template.id,
                }))}
                onChange={setExistingTemplateId}
                type="template"
                value={existingTemplateId}
              />
              <Button
                className="shrink-0"
                disabled={loading || !existingTemplateId}
                type="submit"
                variant="secondary"
              >
                Update template
              </Button>
            </form>
          </>
        ) : null}
      </Dialog>
    </>
  );
};
