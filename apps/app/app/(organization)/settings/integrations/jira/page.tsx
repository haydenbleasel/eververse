import { env } from '@/env';
import { database } from '@/lib/database';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { StackCard } from '@repo/design-system/components/stack-card';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { JiraFieldMappings } from './components/jira-field-mappings';
import { JiraStatusMappings } from './components/jira-status-mappings';
import { ReinstallJiraButton } from './components/reinstall-jira-button';
import { RemoveJiraButton } from './components/remove-jira-button';

export const metadata: Metadata = createMetadata({
  title: 'Jira Integration',
  description: 'Configure your Jira integration settings.',
});

const JiraDiagnostics = dynamic(() =>
  import('./components/jira-diagnostics').then((mod) => mod.JiraDiagnostics)
);

const JiraIntegrationSettings = async () => {
  const atlassianInstallation =
    await database.atlassianInstallation.findFirst();

  if (!atlassianInstallation) {
    return notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-semibold text-2xl">Jira Integration</h1>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <JiraStatusMappings />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <JiraFieldMappings />
      </Suspense>

      {env.NODE_ENV === 'development' && (
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <JiraDiagnostics />
        </Suspense>
      )}

      <StackCard title="Danger Zone" className="flex items-center gap-4">
        <RemoveJiraButton />
        <ReinstallJiraButton />
      </StackCard>
    </div>
  );
};

export default JiraIntegrationSettings;
