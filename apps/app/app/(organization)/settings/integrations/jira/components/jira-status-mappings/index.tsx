import { createClient } from "@repo/atlassian";
import { StackCard } from "@repo/design-system/components/stack-card";
import { LinkIcon } from "lucide-react";
import { database } from "@/lib/database";
import { JiraStatusMappingTable } from "./jira-status-mapping-table";

export const JiraStatusMappings = async () => {
  const [featureStatuses, installation, statusMappings] = await Promise.all([
    database.featureStatus.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),
    database.atlassianInstallation.findFirst({
      select: {
        id: true,
        accessToken: true,
        siteUrl: true,
        email: true,
      },
    }),
    database.installationStatusMapping.findMany({
      where: {
        type: "JIRA",
      },
      select: {
        id: true,
        eventType: true,
        eventId: true,
        featureStatusId: true,
      },
      orderBy: { eventType: "asc" },
    }),
  ]);

  if (!installation) {
    return <div />;
  }

  const atlassian = createClient(installation);
  const jiraStatuses = await atlassian.GET("/rest/api/2/status");

  return (
    <StackCard className="px-0 py-1.5" icon={LinkIcon} title="Status Mappings">
      <JiraStatusMappingTable
        featureStatuses={featureStatuses}
        installationId={installation.id}
        jiraStatuses={
          jiraStatuses.data?.map((jiraStatus) => ({
            label: jiraStatus.name ?? "",
            value: jiraStatus.id ?? "",
            state: jiraStatus.statusCategory?.key,
          })) ?? []
        }
        statusMappings={statusMappings}
      />
    </StackCard>
  );
};
