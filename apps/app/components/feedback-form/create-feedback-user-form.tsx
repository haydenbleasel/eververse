import type { User } from "@repo/backend/auth";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { emailRegex } from "@repo/lib/email";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { createFeedbackUser } from "@/actions/feedback-user/create";

type CreateFeedbackUserFormProperties = {
  readonly onChange: (userId: User["id"]) => void;
};

export const CreateFeedbackUserForm = ({
  onChange,
}: CreateFeedbackUserFormProperties) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const disabled = !(name.trim() && email.trim()) || loading;

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!emailRegex.test(email) || loading) {
      return;
    }

    setLoading(true);

    try {
      const { error, id } = await createFeedbackUser({
        name,
        email,
      });

      if (error) {
        throw new Error(error);
      }

      if (!id) {
        throw new Error("Something went wrong");
      }

      onChange(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        label="Name"
        maxLength={191}
        onChangeText={setName}
        placeholder="Jane Smith"
        value={name}
      />
      <Input
        label="Email"
        maxLength={191}
        onChangeText={setEmail}
        pattern={emailRegex.source}
        placeholder="jane@acme.com"
        type="email"
        value={email}
      />
      <Button disabled={disabled} type="submit">
        Create user
      </Button>
    </form>
  );
};
