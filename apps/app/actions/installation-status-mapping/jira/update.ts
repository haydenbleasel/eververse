"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type {
  AtlassianInstallation,
  FeatureStatus,
  Prisma,
} from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { log } from "@repo/observability/log";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const updateJiraStatusMappings = async (
  installationId: AtlassianInstallation["id"],
  featureStatusId: FeatureStatus["id"],
  jiraStatuses: {
    value: string;
    label: string;
  }[]
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("Not logged in");
    }

    log.info(
      `Deleting existing Jira status mappings for feature status ${featureStatusId} and installation ${installationId}`
    );

    // 1. Delete existing mappings for the feature status
    await database.installationStatusMapping.deleteMany({
      where: {
        type: "JIRA",
        organizationId,
        featureStatusId,
      },
    });

    log.info(
      `Creating new Jira status mappings for feature status ${featureStatusId} and installation ${installationId}: ${JSON.stringify(
        jiraStatuses,
        null,
        2
      )}`
    );

    const data: Prisma.InstallationStatusMappingCreateManyInput[] =
      jiraStatuses.map((jiraStatus) => ({
        organizationId,
        type: "JIRA",
        featureStatusId,
        eventId: jiraStatus.value,
        eventType: jiraStatus.label,
        creatorId: user.id,
      }));

    // 2. Create new mappings for the feature status
    await database.installationStatusMapping.createMany({
      data,
      skipDuplicates: true,
    });

    revalidatePath("/settings/integrations/jira");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
