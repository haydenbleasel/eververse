"use client";

import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEventHandler, useState } from "react";
import { toast } from "sonner";
import { createLinearInstallation } from "@/actions/linear-installation/create";

export const LinearInstallationForm = () => {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!apiKey || loading) {
      return;
    }

    try {
      setLoading(true);

      const response = await createLinearInstallation(apiKey);

      if ("error" in response) {
        throw new Error(response.error);
      }

      toast.success("Linear installation created");

      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <Input
        onChange={({ target }) => setApiKey(target.value)}
        placeholder="Enter your Linear API key"
        value={apiKey}
      />
      <Button disabled={loading} type="submit">
        {loading ? <Loader2Icon className="animate-spin" /> : "Install"}
      </Button>
    </form>
  );
};
