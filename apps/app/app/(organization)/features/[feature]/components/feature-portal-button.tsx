'use client';

import { addFeatureToPortal } from '@/actions/portal-feature/create';
import { editFeaturePortal } from '@/actions/portal-feature/update';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Feature, PortalFeature } from '@repo/backend/prisma/client';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import dynamic from 'next/dynamic';
import { type ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';

const Editor = dynamic(
  async () => {
    const Module = await import(
      /* webpackChunkName: "editor" */
      '@/components/editor'
    );

    return Module.Editor;
  },
  {
    ssr: false,
  }
);

const formSchema = z.object({
  title: z.string(),
  content: z.string(),
});

type FeaturePortalButtonProperties = {
  readonly featureId: Feature['id'];
  readonly defaultTitle: Feature['title'];
  readonly defaultContent: Feature['content'];
  readonly portalFeatureId?: PortalFeature['id'];
  readonly variant: ComponentProps<typeof Button>['variant'];
};

export const FeaturePortalButton = ({
  featureId,
  portalFeatureId,
  defaultTitle,
  defaultContent,
  variant,
}: FeaturePortalButtonProperties) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultTitle,
      content: JSON.stringify(defaultContent),
    },
  });
  const disabled = form.formState.isSubmitting || !form.formState.isValid;
  const title = portalFeatureId ? 'Edit portal feature' : 'Add to portal';

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (disabled) {
      return;
    }

    try {
      const { url, error } = portalFeatureId
        ? await editFeaturePortal(portalFeatureId, values)
        : await addFeatureToPortal(featureId, values);

      if (error) {
        throw new Error(error);
      }

      if (!url) {
        throw new Error('No URL returned');
      }

      toast.success(
        portalFeatureId ? 'Portal feature updated' : 'Feature added to portal'
      );
      window.open(url, '_blank');
      setOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant={variant}
          onClick={() => setOpen(true)}
          className="w-full"
        >
          {title}
        </Button>
      }
      title={title}
      description="Add this feature to your portal to share it with the public. Gather feedback, track sentiment, and validate your ideas faster."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="The portal feature title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className="h-60 overflow-auto rounded border p-4">
                    <Editor
                      defaultValue={JSON.parse(field.value) as object}
                      onUpdate={(editor) =>
                        editor
                          ? field.onChange(JSON.stringify(editor.getJSON()))
                          : undefined
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={disabled}>
            {title}
          </Button>
        </form>
      </Form>
    </Dialog>
  );
};
