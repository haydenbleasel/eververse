'use client';

import { deleteTemplate } from '@/actions/template/delete';
import { updateTemplate } from '@/actions/template/update';
import type { Template as TemplateClass } from '@repo/backend/prisma/client';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { DropdownMenu } from '@repo/design-system/components/precomposed/dropdown-menu';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { EllipsisIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type TemplateSettingsProps = {
  readonly templateId: TemplateClass['id'];
  readonly defaultTitle: TemplateClass['title'];
  readonly defaultDescription: TemplateClass['description'];
};

export const TemplateSettings = ({
  templateId,
  defaultTitle,
  defaultDescription,
}: TemplateSettingsProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteTemplate(templateId);

      if (error) {
        throw new Error(error);
      }

      toast.success('Template deleted successfully');
      setDeleteOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (loading || !title.trim()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateTemplate(templateId, {
        title,
        description,
      });

      if (error) {
        throw new Error(error);
      }

      toast.success('template renamed successfully');
      setRenameOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <DropdownMenu
        data={[
          {
            onClick: () => setRenameOpen(true),
            disabled: loading,
            children: 'Rename',
          },
          {
            onClick: () => router.push(`/settings/templates/${templateId}`),
            disabled: loading,
            children: 'Edit',
          },
          {
            onClick: () => setDeleteOpen(true),
            disabled: loading,
            children: 'Delete',
          },
        ]}
      >
        <Button variant="ghost" size="icon">
          <EllipsisIcon size={16} className="text-muted-foreground" />
        </Button>
      </DropdownMenu>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently this template."
        onClick={handleDelete}
        disabled={loading}
      />

      <Dialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename template"
        description="What would you like to rename this template to?"
        disabled={loading || !title.trim()}
        cta="Rename"
        onClick={handleRename}
      >
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="My new template"
          maxLength={191}
          autoComplete="off"
        />
        <Input
          label="Description"
          value={description ?? ''}
          onChangeText={setDescription}
          placeholder="My template description"
          maxLength={191}
          autoComplete="off"
        />
      </Dialog>
    </>
  );
};
