"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@repo/backend/auth/actions";
import { Input } from "@repo/design-system/components/precomposed/input";
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
import { parseError } from "@repo/lib/parse-error";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";

const formSchema = z.object({
  email: z.string().email(),
});

export const LoginForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await login(values.email);
      toast.success("Check your email for a login link.");
    } catch (error) {
      const message = parseError(error);

      if (message.includes("Signups not allowed for otp")) {
        handleError("You don't have an account yet. Please sign up.");
      } else {
        handleError(error);
      }
    }
  };

  return (
    <div className="grid w-full gap-8 rounded-lg border bg-background p-8 shadow-sm">
      <div className="grid gap-1 text-center">
        <h1 className="font-semibold text-lg tracking-tight">
          Sign in to Eververse
        </h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Please sign in to continue.
        </p>
      </div>
      <div className="grid gap-2">
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="jane@acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={
                form.formState.disabled ||
                !form.formState.isValid ||
                form.formState.isSubmitted ||
                form.formState.isSubmitting
              }
              type="submit"
            >
              Continue
            </Button>
          </form>
        </Form>
      </div>
      <p className="text-center text-muted-foreground text-sm">
        Don't have an account?{" "}
        <Link className="font-medium text-primary underline" href="/sign-up">
          Sign up
        </Link>
      </p>
    </div>
  );
};
