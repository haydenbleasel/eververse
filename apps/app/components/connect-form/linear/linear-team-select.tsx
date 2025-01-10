import { Select } from '@repo/design-system/components/precomposed/select';
import { handleError } from '@repo/design-system/lib/handle-error';
import type { Team } from '@repo/linear';
import { useEffect, useState } from 'react';
import { getLinearTeams } from './get-linear-teams';

type LinearTeamSelectProperties = {
  readonly value: string | undefined;
  readonly onValueChange: (value: string | undefined) => void;
  readonly teams: Team[];
  readonly setTeams: (teams: Team[]) => void;
};

export const LinearTeamSelect = ({
  value,
  onValueChange,
  teams,
  setTeams,
}: LinearTeamSelectProperties) => {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched || loading) {
      return;
    }

    setLoading(true);

    getLinearTeams()
      .then((response) => {
        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.teams) {
          throw new Error('No teams found');
        }

        if (response.teams.length === 1) {
          onValueChange(response.teams[0].id);
        }

        return response.teams;
      })
      .then(setTeams)
      .catch(handleError)
      .finally(() => {
        setLoading(false);
        setFetched(true);
      });
  }, [fetched, loading, onValueChange, setTeams]);

  return (
    <Select
      label="Select a team"
      value={value}
      onChange={onValueChange}
      data={teams.map((team) => ({ value: team.id, label: team.name }))}
      type="team"
      loading={loading}
      disabled={loading || teams.length === 0}
    />
  );
};
