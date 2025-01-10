'use server';

import { database } from '@/lib/database';
import { staticify } from '@/lib/staticify';
import { parseError } from '@repo/lib/parse-error';
import { LinearClient } from '@repo/linear';
import type { Team } from '@repo/linear';

export const getLinearTeams = async (): Promise<{
  error?: string;
  teams?: Team[];
}> => {
  try {
    const linearInstallation = await database.linearInstallation.findFirst({
      select: { accessToken: true },
    });

    if (!linearInstallation) {
      throw new Error('Linear installation not found');
    }

    const linear = new LinearClient({
      accessToken: linearInstallation.accessToken,
      next: {
        revalidate: 0,
      },
    });

    const teams = await linear.teams();

    return { teams: staticify(teams.nodes) };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
