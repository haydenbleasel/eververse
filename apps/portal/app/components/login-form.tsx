import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { useState } from "react";
import { z } from "zod/v3";
import { useFeedbackForm } from "@/hooks/use-feedback-form";

const nameSchema = z.string().min(1);
const emailSchema = z.string().email();

export const LoginForm = () => {
  const feedbackForm = useFeedbackForm();
  const [email, setEmail] = useState(feedbackForm.email);
  const [name, setName] = useState(feedbackForm.name);

  const onClick = () => {
    if (!nameSchema.safeParse(name).success) {
      handleError("Please provide a valid name.");
      return;
    }

    if (!emailSchema.safeParse(email).success) {
      handleError("Please provide a valid email.");
      return;
    }

    feedbackForm.setOpen(false);
    feedbackForm.setEmail(email);
    feedbackForm.setName(name);
    toast.success("Logged in!");
  };

  return (
    <Dialog
      cta="Submit"
      description="Thanks for using our portal. Please provide us with your email and name if you would like to upvote and comment on ideas."
      disabled={!(name.trim() && email.trim())}
      onClick={onClick}
      onOpenChange={(isOpen) => feedbackForm.setOpen(isOpen)}
      open={feedbackForm.open}
      title="Hello there!"
      trigger={<Button>Login</Button>}
    >
      <div className="space-y-4">
        <Input
          className="bg-background"
          label="Name"
          onChangeText={setName}
          placeholder="Jane Smith"
          required
          value={name}
        />
        <Input
          className="bg-background"
          label="Email"
          onChangeText={setEmail}
          placeholder="jane@acme.com"
          required
          type="email"
          value={email}
        />
      </div>
    </Dialog>
  );
};
