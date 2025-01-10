import { database } from '@/lib/database';
import { createOauth2Client } from '@repo/atlassian';
import { StackCard } from '@repo/design-system/components/stack-card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/design-system/components/ui/alert';
import { LinkIcon } from 'lucide-react';
import { JiraStatusMappingTable } from './jira-status-mapping-table';

export const JiraStatusMappings = async () => {
  const [featureStatuses, atlassianInstallation] = await Promise.all([
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
        resources: {
          select: {
            resourceId: true,
            webhooks: {
              select: {
                webhookId: true,
              },
            },
          },
        },
        statusMappings: {
          orderBy: { eventType: 'asc' },
          select: {
            id: true,
            eventType: true,
            eventId: true,
            featureStatusId: true,
          },
        },
      },
    }),
  ]);

  if (!atlassianInstallation) {
    return <div />;
  }

  const resourceId = atlassianInstallation.resources.at(0)?.resourceId;

  if (!resourceId) {
    return (
      <Alert>
        <AlertTitle>No resources found</AlertTitle>
        <AlertDescription>
          You need to connect a Jira resource to your organization to use this
          feature.
        </AlertDescription>
      </Alert>
    );
  }

  const jiraStatuses = await createOauth2Client({
    cloudId: atlassianInstallation.resources[0].resourceId,
    accessToken: atlassianInstallation.accessToken,
  }).GET('/rest/api/3/status');

  return (
    <StackCard title="Status Mappings" icon={LinkIcon} className="px-0 py-1.5">
      <JiraStatusMappingTable
        featureStatuses={featureStatuses}
        statusMappings={atlassianInstallation.statusMappings}
        jiraStatuses={
          jiraStatuses.data?.map((jiraStatus) => ({
            label: jiraStatus.name ?? '',
            value: jiraStatus.id ?? '',
            state: jiraStatus.statusCategory?.key,
          })) ?? []
        }
        installationId={atlassianInstallation.id}
      />
    </StackCard>
  );
};
