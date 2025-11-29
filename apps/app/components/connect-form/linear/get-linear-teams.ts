"use server";

import { parseError } from "@repo/lib/parse-error";
import type { Team } from "@repo/linear";
import { LinearClient } from "@repo/linear";
import { database } from "@/lib/database";
import { staticify } from "@/lib/staticify";

export const getLinearTeams = async (): Promise<{
  error?: string;
  teams?: Team[];
}> => {
  try {
    const linearInstallation = await database.linearInstallation.findFirst({
      select: { apiKey: true },
    });

    if (!linearInstallation) {
      throw new Error("Linear installation not found");
    }

    const linear = new LinearClient({
      apiKey: linearInstallation.apiKey,
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
