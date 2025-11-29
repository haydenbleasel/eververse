"use client";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEventHandler, useState } from "react";
import { toast } from "sonner";
import { createAtlassianInstallation } from "@/actions/atlassian-installation/create";

export const JiraInstallationForm = () => {
  const [email, setEmail] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!(accessToken && email && siteUrl) || loading) {
      return;
    }

    try {
      setLoading(true);

      try {
        new URL(siteUrl);
      } catch (_error) {
        throw new Error("Invalid site URL");
      }

      const response = await createAtlassianInstallation({
        accessToken,
        email,
        siteUrl,
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      toast.success("Jira installation created");

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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        caption="The email for the Atlassian account you're using to install the app."
        label="Email"
        onChange={({ target }) => setEmail(target.value)}
        placeholder="jane@acme.com"
        value={email}
      />
      <Input
        caption="The URL for the Atlassian site you're using to install the app."
        label="Site URL"
        onChange={({ target }) => setSiteUrl(target.value)}
        placeholder="https://acme.atlassian.net"
        value={siteUrl}
      />
      <Input
        caption="The access token you were just provided."
        label="Access Token"
        onChange={({ target }) => setAccessToken(target.value)}
        placeholder="••••••••"
        value={accessToken}
      />
      <div>
        <Button disabled={loading} type="submit">
          {loading ? <Loader2Icon className="animate-spin" /> : "Install"}
        </Button>
      </div>
    </form>
  );
};
