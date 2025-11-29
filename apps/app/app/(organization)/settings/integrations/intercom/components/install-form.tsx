"use client";

import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEventHandler, useState } from "react";
import { toast } from "sonner";
import { createIntercomInstallation } from "@/actions/intercom-installation/create";

export const IntercomInstallationForm = () => {
  const [appId, setAppId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!appId || loading) {
      return;
    }

    try {
      setLoading(true);

      const response = await createIntercomInstallation(appId);

      if ("error" in response) {
        throw new Error(response.error);
      }

      toast.success("Intercom installation created");

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
        onChange={({ target }) => setAppId(target.value)}
        placeholder="Enter your Intercom app ID"
        value={appId}
      />
      <Button disabled={loading} type="submit">
        {loading ? <Loader2Icon className="animate-spin" /> : "Install"}
      </Button>
    </form>
  );
};
