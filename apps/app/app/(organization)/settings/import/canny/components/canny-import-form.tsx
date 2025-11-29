"use client";

import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { useRouter } from "next/navigation";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { cannyImport } from "@/actions/canny-import/create";

export const CannyImportForm = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled = !token.trim() || loading;
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await cannyImport(token);

      if ("error" in response) {
        throw new Error(response.error);
      }

      setToken("");
      toast.success(
        "We're importing your Canny data. This may take up to 30 minutes depending on the size of your data."
      );

      router.push(`/settings/import/canny/${response.id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex w-full items-center gap-2" onSubmit={handleSubmit}>
      <Input
        autoComplete="off"
        className="w-full"
        onChangeText={setToken}
        placeholder="Your Canny API token"
        value={token}
      />
      <Button disabled={disabled} type="submit">
        {loading ? <LoadingCircle /> : "Import"}
      </Button>
    </form>
  );
};
