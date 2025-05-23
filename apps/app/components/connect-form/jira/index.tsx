import { OrDivider } from '@/components/or-divider';
import type { AtlassianInstallation } from '@repo/backend/prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { JiraIssueCreator } from './jira-issue-creator';
import { JiraIssuePicker } from './jira-issue-picker';

type JiraSelectorProperties = {
  readonly jiraAccessToken: AtlassianInstallation['accessToken'] | undefined;
};

export const JiraSelector = ({ jiraAccessToken }: JiraSelectorProperties) => {
  if (!jiraAccessToken) {
    return (
      <Button asChild>
        <a
          href="/settings/integrations/jira"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Jira app
        </a>
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <JiraIssuePicker />
      <OrDivider />
      <JiraIssueCreator />
    </div>
  );
};
