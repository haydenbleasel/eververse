import { Select } from "@repo/design-system/components/precomposed/select";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { RestEndpointMethodTypes } from "@repo/github";
import { useEffect, useState } from "react";
import { getGitHubRepositories } from "./get-github-repositories";

type GitHubRepoSelectProperties = {
  readonly value: string | undefined;
  readonly onValueChange: (value: string | undefined) => void;
  readonly repositories: RestEndpointMethodTypes["apps"]["listReposAccessibleToInstallation"]["response"]["data"]["repositories"];
  readonly setRepositories: (
    repositories: RestEndpointMethodTypes["apps"]["listReposAccessibleToInstallation"]["response"]["data"]["repositories"]
  ) => void;
};

export const GitHubRepoSelect = ({
  value,
  onValueChange,
  repositories,
  setRepositories,
}: GitHubRepoSelectProperties) => {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched || loading) {
      return;
    }

    setLoading(true);

    getGitHubRepositories()
      .then((response) => {
        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.repositories) {
          throw new Error("No repositories found");
        }

        if (response.repositories.length === 1) {
          onValueChange(`${response.repositories[0].id}`);
        }

        return response.repositories;
      })
      .then(setRepositories)
      .catch(handleError)
      .finally(() => {
        setLoading(false);
        setFetched(true);
      });
  }, [fetched, loading, onValueChange, setRepositories]);

  return (
    <div className="relative">
      <Select
        data={repositories.map((repo) => ({
          value: `${repo.id}`,
          label: repo.name,
        }))}
        disabled={loading || repositories.length === 0}
        label="Select a repository"
        loading={loading}
        onChange={onValueChange}
        type="repo"
        value={value}
      />
    </div>
  );
};
