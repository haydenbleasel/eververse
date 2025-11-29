import type { User } from "@repo/backend/auth";
import type { FeedbackUser } from "@repo/backend/prisma/client";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { FormEventHandler } from "react";
import { useId, useState } from "react";
import { createFeedbackOrganization } from "@/actions/feedback-organization/create";

type CreateFeedbackOrganizationFormProperties = {
  readonly onChange: (userId: User["id"]) => void;
  readonly feedbackUser: FeedbackUser["id"];
};

export const CreateFeedbackOrganizationForm = ({
  onChange,
  feedbackUser,
}: CreateFeedbackOrganizationFormProperties) => {
  const _nameId = useId();
  const _domainId = useId();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled = !(name.trim() && domain.trim()) || loading;

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error, id } = await createFeedbackOrganization({
        name,
        domain,
        feedbackUser,
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
        placeholder="Acme, Inc."
        value={name}
      />
      <Input
        label="Domain"
        maxLength={191}
        onChangeText={setDomain}
        placeholder="acme.com"
        value={domain}
      />
      <Button disabled={disabled} type="submit">
        Create company
      </Button>
    </form>
  );
};
