"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Widget, WidgetItem } from "@repo/backend/prisma/client";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { DynamicIcon } from "@repo/widget/components/dynamic-icon";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { createWidgetItem } from "@/actions/widget-item/create";
import { updateWidgetItem } from "@/actions/widget-item/update";

const formSchema = z.object({
  name: z.string().min(1).max(255),
  link: z.string().url().min(1).max(255),
  icon: z.string().min(1).max(255),
});
const iconKeys = Object.keys(dynamicIconImports);

type CreateLinkModalProperties = {
  readonly widgetId: Widget["id"];
  readonly data?: WidgetItem;
  readonly children: ReactNode;
};

export const CreateLinkModal = ({
  widgetId,
  data,
  children,
}: CreateLinkModalProperties) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name,
      link: data?.link,
      icon: data?.icon ?? iconKeys[0],
    },
  });
  const disabled = form.formState.isSubmitting || !form.formState.isValid;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (disabled) {
      return;
    }

    try {
      const response = data
        ? await updateWidgetItem(data.id, values)
        : await createWidgetItem(widgetId, values);

      if (response.error) {
        throw new Error(response.error);
      }

      setOpen(false);
      form.reset();

      toast.success(data ? "Link updated" : "Link created");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog
      description="Link out to a Slack channel, documentation or other resources."
      disabled={disabled}
      modal={false}
      onOpenChange={setOpen}
      open={open}
      title="Add a new link"
      trigger={children}
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product changelog" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <div>
                  <Select
                    data={iconKeys.map((icon) => ({
                      label: icon,
                      value: icon,
                    }))}
                    onChange={(value) => form.setValue("icon", value)}
                    renderItem={(item) => (
                      <div className="flex items-center gap-2">
                        <DynamicIcon
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          name={item.value as keyof typeof dynamicIconImports}
                          size={16}
                        />
                        <span>{item.label}</span>
                      </div>
                    )}
                    value={field.value}
                  />
                </div>
              </FormItem>
            )}
          />
          <Button disabled={disabled} type="submit">
            {data ? "Update link" : "Create link"}
          </Button>
        </form>
      </Form>
    </Dialog>
  );
};
