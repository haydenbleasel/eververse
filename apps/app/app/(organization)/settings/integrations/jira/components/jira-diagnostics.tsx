import { database } from '@/lib/database';
import { StackCard } from '@repo/design-system/components/stack-card';

export const JiraDiagnostics = async () => {
  const atlassianInstallation = await database.atlassianInstallation.findFirst({
    select: {
      id: true,
      resources: true,
      webhooks: true,
      statusMappings: true,
      fieldMappings: true,
      featureConnections: true,
    },
  });

  return (
    <StackCard title="Jira Diagnostics">
      <ul>
        <li>Resources: {atlassianInstallation?.resources.length}</li>
        <li>Webhooks: {atlassianInstallation?.webhooks.length}</li>
        <li>Status Mappings: {atlassianInstallation?.statusMappings.length}</li>
        <li>Field Mappings: {atlassianInstallation?.fieldMappings.length}</li>
        <li>
          Feature Connections:{' '}
          {atlassianInstallation?.featureConnections.length}
        </li>
      </ul>
    </StackCard>
  );
};
