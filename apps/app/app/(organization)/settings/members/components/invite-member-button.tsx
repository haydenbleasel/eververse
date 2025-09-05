'use client';

import { inviteMember } from '@/actions/users/invite';
import { zodResolver } from '@hookform/resolvers/zod';
import { EververseRole } from '@repo/backend/auth';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Select } from '@repo/design-system/components/precomposed/select';
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
import { capitalize } from '@repo/lib/format';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v3';

const formSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(EververseRole),
});

export const InviteMemberButton = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const disabled = form.formState.isSubmitting || !form.formState.isValid;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await inviteMember(values.email, values.role);

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Member invited successfully');
      setOpen(false);
      form.reset();
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
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full"
        >
          Invite Member
        </Button>
      }
      title="Invite Member"
      description="Invite a member to your organization."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="jane@acme.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select
                    data={Object.values(EververseRole).map((role) => ({
                      label: capitalize(role),
                      value: role,
                    }))}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={disabled}>
            Invite
          </Button>
        </form>
      </Form>
    </Dialog>
  );
};
