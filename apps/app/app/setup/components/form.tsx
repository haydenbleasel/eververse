'use client';

import { createOrganization } from '@/actions/organization/create';
import { updateOrganization } from '@/actions/organization/update';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@repo/backend/auth/client';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Textarea } from '@repo/design-system/components/precomposed/textarea';
import { Prose } from '@repo/design-system/components/prose';
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
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1),
  logo: z.instanceof(File).optional(),
  productDescription: z.string().min(1),
});

export const CreateOrganizationForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: undefined,
      productDescription: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createOrganization({
        name: values.name,
        productDescription: values.productDescription,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      if (values.logo) {
        const supabase = await createClient();
        const uploadResponse = await supabase.storage
          .from('organizations')
          .upload(response.id, values.logo);

        if (uploadResponse.error) {
          throw uploadResponse.error;
        }

        const { data: publicUrl } = supabase.storage
          .from('organizations')
          .getPublicUrl(response.id);

        const updateResponse = await updateOrganization({
          logoUrl: publicUrl.publicUrl,
        });

        if ('error' in updateResponse) {
          throw new Error(updateResponse.error);
        }
      }

      router.push('/');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="grid w-full gap-4 rounded-lg border bg-background p-8 shadow-sm">
      <Prose className="prose-sm text-center">
        <h1 className="m-0 font-semibold text-lg">Create your organization</h1>
        <p className="m-0 text-muted-foreground">
          Welcome to Eververse! Please fill in the details below to create your
          organization.
        </p>
      </Prose>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logo"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-2">
                  <FormLabel>Logo URL</FormLabel>
                  <p className="text-muted-foreground text-xs">Optional</p>
                </div>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    accept="image/*"
                    onChange={(event) => onChange(event.target.files?.[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Acme is a platform for creating and managing products."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={
              form.formState.disabled ||
              !form.formState.isValid ||
              form.formState.isSubmitting
            }
          >
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
};
