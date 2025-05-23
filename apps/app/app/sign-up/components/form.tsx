'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { signup } from '@repo/backend/auth/actions';
import { Input } from '@repo/design-system/components/precomposed/input';
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
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email(),
});

export const SignupForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await signup(values.email, values.firstName, values.lastName);
      toast.success('Check your email for a signup link.');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="grid w-full gap-4 rounded-lg border bg-background p-8 shadow-sm">
      <Prose className="prose-sm text-center">
        <h1 className="m-0 font-semibold text-lg">Create your account</h1>
        <p className="m-0 text-muted-foreground">
          Welcome! Please fill in the details to get started.
        </p>
      </Prose>
      <div className="grid gap-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>First Name</FormLabel>
                      <p className="text-muted-foreground text-xs">Optional</p>
                    </div>
                    <FormControl>
                      <Input placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>Last Name</FormLabel>
                      <p className="text-muted-foreground text-xs">Optional</p>
                    </div>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <Button
              type="submit"
              disabled={
                form.formState.disabled ||
                !form.formState.isValid ||
                form.formState.isSubmitted ||
                form.formState.isSubmitting
              }
            >
              Continue
            </Button>
          </form>
        </Form>
      </div>
      <Prose className="prose-sm text-center">
        <p className="text-muted-foreground">
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </p>
      </Prose>
    </div>
  );
};
