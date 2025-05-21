'use client';

import { deleteFeature } from '@/actions/feature/delete';
import { createTemplateFromFeature } from '@/actions/template/create';
import { updateTemplateFromFeature } from '@/actions/template/update';
import { OrDivider } from '@/components/or-divider';
import type { Feature, Template } from '@repo/backend/prisma/client';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { DropdownMenu } from '@repo/design-system/components/precomposed/dropdown-menu';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Select } from '@repo/design-system/components/precomposed/select';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { QueryClient } from '@tanstack/react-query';
import { MoreHorizontalIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEventHandler } from 'react';

type FeatureSettingsDropdownProperties = {
  readonly featureId: Feature['id'];
  readonly templates: Pick<Template, 'id' | 'title'>[];
};

export const FeatureSettingsDropdown = ({
  featureId,
  templates,
}: FeatureSettingsDropdownProperties) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [existingTemplateId, setExistingTemplateId] = useState<
    Template['id'] | undefined
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
      router.push('/features');
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

      if ('error' in response) {
        throw new Error(response.error);
      }

      await queryClient.invalidateQueries({
        queryKey: ['templates'],
      });

      toast.success('Template created successfully');
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
        queryKey: ['templates'],
      });

      toast.success('Template updated successfully');
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
              children: 'Delete',
            },
            {
              onClick: () => setSaveTemplateOpen(true),
              disabled: loading,
              children: 'Save as Template',
            },
          ]}
        >
          <Tooltip content="Settings" side="bottom" align="end">
            <Button variant="ghost" size="icon">
              <MoreHorizontalIcon size={16} />
            </Button>
          </Tooltip>
        </DropdownMenu>
      </div>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete this feature."
        onClick={handleDelete}
        disabled={loading}
      />

      <Dialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        title="Save as Template"
        description="Save this feature's content as a template for future use."
        disabled={loading || !templateName.trim()}
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <Input
            label="Title"
            value={templateName}
            onChangeText={setTemplateName}
            placeholder="My Template"
            maxLength={191}
            autoComplete="off"
            required
          />

          <Input
            label="Description"
            value={templateDescription}
            onChangeText={setTemplateDescription}
            placeholder="A brief description of the template"
            maxLength={191}
            autoComplete="off"
          />

          <Button type="submit" disabled={loading || !templateName.trim()}>
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
                value={existingTemplateId}
                onChange={setExistingTemplateId}
                data={templates.map((template) => ({
                  label: template.title,
                  value: template.id,
                }))}
                type="template"
              />
              <Button
                type="submit"
                variant="secondary"
                className="shrink-0"
                disabled={loading || !existingTemplateId}
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
