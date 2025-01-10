'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Textarea } from '@repo/design-system/components/precomposed/textarea';
import { Prose } from '@repo/design-system/components/prose';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { handleError } from '@repo/design-system/lib/handle-error';
import { emailRegex } from '@repo/lib/email';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { contact } from '../actions/contact';

const formSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  message: z.string().min(1).max(1000),
});

const ContactFormInner = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await contact(values);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Message sent!');
      form.reset();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Prose className="max-w-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    placeholder="Jane Smith"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Your full name, so we know who we are talking to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    placeholder="jane@acme.com"
                    {...field}
                    pattern={emailRegex.source}
                  />
                </FormControl>
                <FormDescription>
                  We will never share your email with anyone else.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Hi there, I'm interested in..."
                    className="max-h-[20rem] min-h-[10rem] resize-y bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            Submit
          </Button>
        </form>
      </Form>
    </Prose>
  );
};

export const ContactForm = () => (
  <Suspense>
    <ContactFormInner />
  </Suspense>
);
