import { database } from '@/lib/database';
import { StackCard } from '@repo/design-system/components/stack-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CreateStatusMappingsButton } from './components/create-status-mappings-button';
import { FeatureStatusConnectionPicker } from './components/feature-status-connection-picker';

export const metadata: Metadata = createMetadata({
  title: 'GitHub Integration',
  description: 'Configure your GitHub integration settings.',
});

const GitHubIntegrationSettings = async () => {
  const [featureStatuses, gitHubInstallation] = await Promise.all([
    database.featureStatus.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),
    database.gitHubInstallation.findFirst({
      select: {
        id: true,
        statusMappings: {
          orderBy: { eventType: 'asc' },
          select: {
            id: true,
            eventType: true,
            featureStatusId: true,
          },
        },
      },
    }),
  ]);

  if (!gitHubInstallation) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-semibold text-2xl">GitHub Integration</h1>

      <StackCard title="Status Mappings" className="p-0">
        {gitHubInstallation.statusMappings.length > 0 ? (
          <Table className="mb-0">
            <TableHeader>
              <TableRow>
                <TableHead>GitHub Issue Event</TableHead>
                <TableHead>Feature Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gitHubInstallation.statusMappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium font-mono">
                    {mapping.eventType}
                  </TableCell>
                  <TableCell>
                    <FeatureStatusConnectionPicker
                      connectionId={mapping.id}
                      statuses={featureStatuses}
                      defaultValue={mapping.featureStatusId}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-4">
            <p className="mb-4">You don&apos;t have any status mappings yet.</p>
            <CreateStatusMappingsButton />
          </div>
        )}
      </StackCard>
    </div>
  );
};

export default GitHubIntegrationSettings;
