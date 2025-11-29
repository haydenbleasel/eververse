import { Select } from "@repo/design-system/components/precomposed/select";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { Issue } from "@repo/linear";
import { useEffect, useState } from "react";
import { getLinearIssues } from "./get-linear-issues";

type LinearIssueSelectProperties = {
  readonly value: string | undefined;
  readonly onValueChange: (value: string | undefined) => void;
  readonly team: string;
  readonly issues: Issue[];
  readonly setIssues: (issues: Issue[]) => void;
};

export const LinearIssueSelect = ({
  team,
  value,
  onValueChange,
  issues,
  setIssues,
}: LinearIssueSelectProperties) => {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched || loading) {
      return;
    }

    setLoading(true);

    getLinearIssues(team)
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
  }, [fetched, loading, team, setIssues]);

  return (
    <Select
      data={issues.map((issueItem) => ({
        value: issueItem.id,
        label: issueItem.title,
      }))}
      disabled={loading || issues.length === 0}
      label="Select an existing issue"
      loading={loading}
      onChange={onValueChange}
      renderItem={(item) => {
        const issue = issues.find((issueItem) => issueItem.id === item.value);

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
