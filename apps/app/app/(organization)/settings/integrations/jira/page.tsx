import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { database } from "@/lib/database";
import { InstallJira } from "./components/install";
import { ManageJira } from "./components/manage";

export const metadata: Metadata = createMetadata({
  title: "Jira Integration",
  description: "Configure your Jira integration settings.",
});

const JiraIntegrationSettings = async () => {
  const count = await database.atlassianInstallation.count();

  if (count === 0) {
    return <InstallJira />;
  }

  return <ManageJira />;
};

export default JiraIntegrationSettings;
