import type { AtlassianInstallation } from "@repo/backend/prisma/client";
import { Button } from "@repo/design-system/components/ui/button";
import { OrDivider } from "@/components/or-divider";
import { JiraIssueCreator } from "./jira-issue-creator";
import { JiraIssuePicker } from "./jira-issue-picker";

type JiraSelectorProperties = {
  readonly jiraAccessToken: AtlassianInstallation["accessToken"] | undefined;
};

export const JiraSelector = ({ jiraAccessToken }: JiraSelectorProperties) => {
  if (!jiraAccessToken) {
    return (
      <Button asChild>
        <a
          href="/settings/integrations/jira"
          rel="noopener noreferrer"
          target="_blank"
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
