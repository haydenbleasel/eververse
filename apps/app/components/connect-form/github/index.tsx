import { OrDivider } from '@/components/or-divider';
import type { GitHubInstallation } from '@repo/backend/prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import type { RestEndpointMethodTypes } from '@repo/github';
import Image from 'next/image';
import { useState } from 'react';
import { useConnectForm } from '../use-connect-form';
import { connectToGitHub } from './connect-to-github';
import { createGitHubIssue } from './create-github-issue';
import { GitHubIssueSelect } from './github-issue-select';
import { GitHubRepoSelect } from './github-repo-select';

type GitHubSelectorProperties = {
  readonly githubAppInstallationId:
    | GitHubInstallation['installationId']
    | undefined;
};

export const GitHubSelector = ({
  githubAppInstallationId,
}: GitHubSelectorProperties) => {
  const { hide, featureId } = useConnectForm();
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<
    RestEndpointMethodTypes['apps']['listReposAccessibleToInstallation']['response']['data']['repositories']
  >([]);
  const [issues, setIssues] = useState<
    RestEndpointMethodTypes['issues']['listForRepo']['response']['data']
  >([]);
  const [repository, setRepository] = useState<string | undefined>();
  const [issue, setIssue] = useState<string | undefined>();
  const disabled = loading || !repository || !issue || !githubAppInstallationId;
  const selectedRepository = repositories.find(
    (repoItem) => `${repoItem.id}` === repository
  );

  const handleConnectGitHub = async () => {
    const selectedIssue = issues.find(
      (issueItem) => `${issueItem.id}` === issue
    );

    if (!featureId || loading || !selectedIssue || !selectedRepository) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await connectToGitHub({
        featureId,
        externalId: `${selectedIssue.id}`,
        href: selectedIssue.html_url,
        owner: selectedRepository.owner.login,
        repo: selectedRepository.name,
        issueNumber: selectedIssue.number,
      });

      if (error) {
        throw new Error(error);
      }

      hide();

      window.open(selectedIssue.html_url, '_blank');
      window.location.reload();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGitHubIssue = async () => {
    if (!featureId || loading || !selectedRepository) {
      return;
    }

    setLoading(true);

    try {
      const issueResponse = await createGitHubIssue({
        owner: selectedRepository.owner.login,
        repo: selectedRepository.name,
        featureId,
      });

      if (issueResponse.error) {
        throw new Error(issueResponse.error);
      }

      if (!issueResponse.id || !issueResponse.href || !issueResponse.number) {
        throw new Error('Issue not found');
      }

      const { error } = await connectToGitHub({
        featureId,
        externalId: issueResponse.id,
        href: issueResponse.href,
        owner: selectedRepository.owner.login,
        repo: selectedRepository.name,
        issueNumber: issueResponse.number,
      });

      if (error) {
        throw new Error(error);
      }

      hide();

      window.open(issueResponse.href, '_blank');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!githubAppInstallationId) {
    return (
      <Button asChild>
        <a
          href="/api/integrations/github/start"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className="mr-2 h-4 w-4"
            alt=""
            src="/github.svg"
            width={16}
            height={16}
          />
          Install GitHub app
        </a>
      </Button>
    );
  }

  return (
    <>
      <GitHubRepoSelect
        value={repository}
        onValueChange={setRepository}
        repositories={repositories}
        setRepositories={setRepositories}
      />
      {selectedRepository ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-4">
            <GitHubIssueSelect
              value={issue}
              onValueChange={setIssue}
              issues={issues}
              setIssues={setIssues}
              repository={selectedRepository}
            />
            <Button
              type="submit"
              disabled={disabled}
              onClick={handleConnectGitHub}
              className="shrink-0"
            >
              Sync feature
            </Button>
          </div>
          <OrDivider />
          <Button
            variant="secondary"
            onClick={handleCreateGitHubIssue}
            disabled={loading}
          >
            Create new issue
          </Button>
        </div>
      ) : null}
    </>
  );
};
