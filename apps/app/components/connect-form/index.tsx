"use client";

import type {
  AtlassianInstallation,
  GitHubInstallation,
  LinearInstallation,
} from "@repo/backend/prisma/client";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { cn } from "@repo/design-system/lib/utils";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useState } from "react";
import GitHubImage from "../../public/github.svg";
import JiraImage from "../../public/jira.svg";
import LinearImage from "../../public/linear.svg";
import { GitHubSelector } from "./github";
import { JiraSelector } from "./jira";
import { LinearSelector } from "./linear";
import { useConnectForm } from "./use-connect-form";

type ConnectFormProperties = {
  readonly githubAppInstallationId:
    | GitHubInstallation["installationId"]
    | undefined;
  readonly linearApiKey: LinearInstallation["apiKey"] | undefined;
  readonly jiraAccessToken: AtlassianInstallation["accessToken"] | undefined;
};

const platformOptions: {
  label: string;
  value: string;
  image: StaticImageData;
}[] = [
  { label: "GitHub", value: "GITHUB", image: GitHubImage as StaticImageData },
  { label: "Linear", value: "LINEAR", image: LinearImage as StaticImageData },
  { label: "Jira", value: "JIRA", image: JiraImage as StaticImageData },
];

export const ConnectForm = ({
  githubAppInstallationId,
  linearApiKey,
  jiraAccessToken,
}: ConnectFormProperties) => {
  const { isOpen, toggle } = useConnectForm();
  const [platform, setPlatform] = useState<string | undefined>();

  return (
    <Dialog
      description="Link this feature to a delivery app to track progress."
      modal={false}
      onOpenChange={toggle}
      open={isOpen}
      title="Connect feature"
    >
      <div className="flex flex-col gap-6 py-2">
        <div className="grid w-full grid-cols-3 gap-4">
          {platformOptions.map((option) => (
            <button
              className={cn(
                "space-y-2 rounded border bg-card p-4",
                platform === option.value ? "bg-secondary" : "bg-background"
              )}
              key={option.value}
              onClick={() => setPlatform(option.value)}
              type="button"
            >
              <Image
                alt={option.label}
                className="mx-auto"
                height={32}
                src={option.image}
                width={32}
              />
              <span className="pointer-events-none mt-2 block select-none font-medium text-sm">
                {option.label}
              </span>
            </button>
          ))}
        </div>
        {platform === "GITHUB" ? (
          <GitHubSelector githubAppInstallationId={githubAppInstallationId} />
        ) : null}
        {platform === "LINEAR" ? (
          <LinearSelector linearApiKey={linearApiKey} />
        ) : null}
        {platform === "JIRA" ? (
          <JiraSelector jiraAccessToken={jiraAccessToken} />
        ) : null}
      </div>
    </Dialog>
  );
};
