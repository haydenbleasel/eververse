"use server";

import { database } from "@repo/backend/database";
import { parseError } from "@repo/lib/src/parse-error";

export const deleteIntercomInstallation = async (
  id: string
): Promise<
  | {
      error: string;
    }
  | {
      success: true;
    }
> => {
  try {
    const installation = await database.intercomInstallation.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!installation) {
      throw new Error("Intercom installation not found");
    }

    await database.intercomInstallation.delete({
      where: { id },
      select: { id: true },
    });

    return {
      success: true,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
