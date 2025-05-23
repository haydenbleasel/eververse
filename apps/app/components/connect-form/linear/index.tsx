import { OrDivider } from '@/components/or-divider';
import type { LinearInstallation } from '@repo/backend/prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import type { Issue, Team } from '@repo/linear';
import { useState } from 'react';
import { useConnectForm } from '../use-connect-form';
import { connectToLinear } from './connect-to-linear';
import { createLinearIssue } from './create-linear-issue';
import { LinearIssueSelect } from './linear-issue-select';
import { LinearTeamSelect } from './linear-team-select';

type LinearSelectorProperties = {
  readonly linearApiKey: LinearInstallation['apiKey'] | undefined;
};

export const LinearSelector = ({ linearApiKey }: LinearSelectorProperties) => {
  const { hide, featureId } = useConnectForm();
  const [loading, setLoading] = useState(false);
  const [linearTeams, setLinearTeams] = useState<Team[]>([]);
  const [linearTeam, setLinearTeam] = useState<string | undefined>();
  const [linearIssues, setLinearIssues] = useState<Issue[]>([]);
  const [linearIssue, setLinearIssue] = useState<string | undefined>();
  const disabled = loading || !linearTeam || !linearIssue;

  const handleConnectLinear = async () => {
    const selectedIssue = linearIssues.find(
      (issueItem) => issueItem.id === linearIssue
    );

    if (!featureId || loading || !selectedIssue) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await connectToLinear({
        featureId,
        externalId: selectedIssue.id,
        href: selectedIssue.url,
      });

      if (error) {
        throw new Error(error);
      }

      hide();

      window.open(selectedIssue.url, '_blank');
      window.location.reload();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLinearIssue = async () => {
    if (!featureId || loading || !linearTeam) {
      return;
    }

    setLoading(true);

    try {
      const issueResponse = await createLinearIssue({
        teamId: linearTeam,
        featureId,
      });

      if (issueResponse.error) {
        throw new Error(issueResponse.error);
      }

      if (!issueResponse.id || !issueResponse.href) {
        throw new Error('Issue not found');
      }

      const { error } = await connectToLinear({
        featureId,
        externalId: issueResponse.id,
        href: issueResponse.href,
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

  if (!linearApiKey) {
    return (
      <Button asChild>
        <a
          href="/api/integrations/linear/start"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Linear app
        </a>
      </Button>
    );
  }

  return (
    <>
      <LinearTeamSelect
        value={linearTeam}
        onValueChange={setLinearTeam}
        teams={linearTeams}
        setTeams={setLinearTeams}
      />
      {linearTeam ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-4">
            <LinearIssueSelect
              value={linearIssue}
              onValueChange={setLinearIssue}
              issues={linearIssues}
              setIssues={setLinearIssues}
              team={linearTeam}
            />
            <Button
              type="submit"
              disabled={disabled}
              onClick={handleConnectLinear}
              className="shrink-0"
            >
              Sync feature
            </Button>
          </div>
          <OrDivider />
          <Button
            variant="secondary"
            onClick={handleCreateLinearIssue}
            disabled={loading}
          >
            Create new issue
          </Button>
        </div>
      ) : null}
    </>
  );
};
