"use client";

import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Textarea } from "@repo/design-system/components/precomposed/textarea";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { useState } from "react";
import { useFeedbackForm } from "@/hooks/use-feedback-form";
import { createFeedback } from "../(roadmap)/[featureId]/actions/create-feedback";
import { LoginForm } from "./login-form";

type CreateIdeaFormProperties = {
  readonly slug: string;
  readonly orgName: string;
};

export const CreateIdeaForm = ({ slug, orgName }: CreateIdeaFormProperties) => {
  const [open, setOpen] = useState(false);
  const { email, name } = useFeedbackForm();
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled =
    !(email.trim() && name.trim()) || feedback.trim().length < 10 || loading;

  const onClick = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await createFeedback({
        email,
        name,
        feedback,
        slug,
      });

      if (error) {
        throw new Error(error);
      }

      setFeedback("");
      toast.success("Idea submitted!");
      setOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!(name.trim() && email.trim())) {
    return <LoginForm />;
  }

  return (
    <Dialog
      cta="Submit Feedback"
      description={`What's on your mind? Share your ideas with ${orgName}!`}
      disabled={disabled}
      onClick={onClick}
      onOpenChange={setOpen}
      open={open}
      title="Submit a new idea"
      trigger={<Button>Submit an idea</Button>}
    >
      <Textarea
        caption="Write at least 10 characters!"
        className="max-h-[20rem] min-h-[10rem] bg-background"
        label="Feedback"
        onChangeText={setFeedback}
        placeholder="What is your idea?"
        required
        value={feedback}
      />
    </Dialog>
  );
};
