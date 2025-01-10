'use server';

import { database } from '@/lib/database';
import { staticify } from '@/lib/staticify';
import { parseError } from '@repo/lib/parse-error';
import { LinearClient } from '@repo/linear';
import type { Issue } from '@repo/linear';

export const getLinearIssues = async (
  teamId: string
): Promise<{
  error?: string;
  issues?: Issue[];
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

    const issues = await linear.issues({
      filter: {
        team: {
          id: {
            eq: teamId,
          },
        },
      },
    });

    return { issues: staticify(issues.nodes) };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
