import { database } from '@/lib/database';
import { createClient } from '@repo/atlassian';
import { StackCard } from '@repo/design-system/components/stack-card';
import {} from '@repo/design-system/components/ui/alert';
import {
  ArrowRightIcon,
  DotIcon,
  LinkIcon,
  RocketIcon,
  TextIcon,
} from 'lucide-react';
import { JiraFieldMappingTable } from './jira-field-mapping-table';

const fixedFields = [
  {
    internal: 'Release',
    external: 'Fix Version',
    icon: RocketIcon,
  },
  {
    internal: 'Title',
    external: 'Summary',
    icon: TextIcon,
  },
  {
    internal: 'Description',
    external: 'Description',
    icon: TextIcon,
  },
  {
    internal: 'Status',
    external: 'Status',
    icon: DotIcon,
  },
];

export const JiraFieldMappings = async () => {
  const installation = await database.atlassianInstallation.findFirst({
    select: {
      id: true,
      accessToken: true,
      email: true,
      siteUrl: true,
      fieldMappings: {
        select: {
          id: true,
          internalId: true,
          externalId: true,
        },
      },
    },
  });

  if (!installation) {
    return <div />;
  }

  const atlassian = createClient(installation);
  const jiraFields = await atlassian.GET('/rest/api/2/field');

  return (
    <StackCard title="Field Mappings" icon={LinkIcon} className="px-0 py-1.5">
      <div>
        {fixedFields.map((field) => (
          <div
            key={field.internal}
            className="flex items-center justify-between gap-3 px-3 py-1.5"
          >
            <div className="flex-1">
              <div className="flex h-9 w-full items-center gap-2 rounded-md border bg-secondary p-3 text-sm shadow-sm">
                <field.icon size={16} className="text-muted-foreground" />
                {field.external}
              </div>
            </div>
            <div className="flex h-9 shrink-0 items-center justify-center">
              <ArrowRightIcon size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex h-9 w-full items-center gap-2 rounded-md border bg-secondary p-3 text-sm shadow-sm">
                <field.icon size={16} className="text-muted-foreground" />
                {field.internal}
              </div>
            </div>
          </div>
        ))}
      </div>
      <JiraFieldMappingTable
        fieldMappings={installation.fieldMappings}
        jiraFields={
          jiraFields.data
            ?.filter((field) => field.schema?.type)
            .filter((field) => field.custom)
            .map((field) => ({
              label: field.name ?? '',
              value: field.id ?? '',
              type: field.schema?.type ?? '',
            })) ?? []
        }
        installationId={installation.id}
      />
    </StackCard>
  );
};
