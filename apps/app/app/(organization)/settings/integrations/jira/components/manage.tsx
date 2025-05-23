import { database } from '@/lib/database';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { StackCard } from '@repo/design-system/components/stack-card';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { JiraFieldMappings } from './jira-field-mappings';
import { JiraStatusMappings } from './jira-status-mappings';
import { RemoveJiraButton } from './remove-jira-button';

export const metadata: Metadata = createMetadata({
  title: 'Jira Integration',
  description: 'Configure your Jira integration settings.',
});

export const ManageJira = async () => {
  const atlassianInstallation =
    await database.atlassianInstallation.findFirst();

  if (!atlassianInstallation) {
    return notFound();
  }

  return (
    <>
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl">Jira</h1>
        <p className="mb-0 text-muted-foreground">
          Manage your Jira integration.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <JiraStatusMappings />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <JiraFieldMappings />
      </Suspense>

      <StackCard title="Danger Zone" className="flex items-center gap-4">
        <RemoveJiraButton />
      </StackCard>
    </>
  );
};
