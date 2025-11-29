import { Select } from "@repo/design-system/components/precomposed/select";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { RestEndpointMethodTypes } from "@repo/github";
import { useEffect, useState } from "react";
import { getGitHubIssues } from "./get-github-issues";

type GitHubIssueSelectProperties = {
  readonly value: string | undefined;
  readonly onValueChange: (value: string | undefined) => void;
  readonly repository: RestEndpointMethodTypes["apps"]["listReposAccessibleToInstallation"]["response"]["data"]["repositories"][0];
  readonly issues: RestEndpointMethodTypes["issues"]["listForRepo"]["response"]["data"];
  readonly setIssues: (
    issues: RestEndpointMethodTypes["issues"]["listForRepo"]["response"]["data"]
  ) => void;
};

export const GitHubIssueSelect = ({
  repository,
  value,
  onValueChange,
  issues,
  setIssues,
}: GitHubIssueSelectProperties) => {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched || loading) {
      return;
    }

    setLoading(true);

    getGitHubIssues(repository.owner.login, repository.name)
      .then((response) => {
        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.issues) {
          throw new Error("No issues found");
        }

        return response.issues;
      })
      .then(setIssues)
      .catch(handleError)
      .finally(() => {
        setLoading(false);
        setFetched(true);
      });
  }, [fetched, loading, repository.name, repository.owner.login, setIssues]);

  return (
    <Select
      data={issues.map((issueItem) => ({
        value: `${issueItem.id}`,
        label: issueItem.title,
      }))}
      disabled={loading || issues.length === 0}
      label="Select an existing issue"
      loading={loading}
      onChange={onValueChange}
      renderItem={(item) => {
        const issue = issues.find(
          (issueItem) => issueItem.id === Number.parseInt(item.value, 10)
        );

        if (!issue) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <span>{item.label}</span>
            <p className="text-muted-foreground text-xs">#{issue.number}</p>
          </div>
        );
      }}
      type="issue"
      value={value}
    />
  );
};
