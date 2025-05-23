import { database } from '@/lib/database';
import { createClient } from '@repo/atlassian';
import { StackCard } from '@repo/design-system/components/stack-card';
import {} from '@repo/design-system/components/ui/alert';
import { LinkIcon } from 'lucide-react';
import { JiraStatusMappingTable } from './jira-status-mapping-table';

export const JiraStatusMappings = async () => {
  const [featureStatuses, installation, statusMappings] = await Promise.all([
    database.featureStatus.findMany({
      orderBy: { order: 'asc' },
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
        type: 'JIRA',
      },
      select: {
        id: true,
        eventType: true,
        eventId: true,
        featureStatusId: true,
      },
      orderBy: { eventType: 'asc' },
    }),
  ]);

  if (!installation) {
    return <div />;
  }

  const atlassian = createClient(installation);
  const jiraStatuses = await atlassian.GET('/rest/api/2/status');

  return (
    <StackCard title="Status Mappings" icon={LinkIcon} className="px-0 py-1.5">
      <JiraStatusMappingTable
        featureStatuses={featureStatuses}
        statusMappings={statusMappings}
        jiraStatuses={
          jiraStatuses.data?.map((jiraStatus) => ({
            label: jiraStatus.name ?? '',
            value: jiraStatus.id ?? '',
            state: jiraStatus.statusCategory?.key,
          })) ?? []
        }
        installationId={installation.id}
      />
    </StackCard>
  );
};
