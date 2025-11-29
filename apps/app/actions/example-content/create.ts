"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";
import {
  createExampleChangelogs,
  createExampleFeatures,
  createExampleFeedbackOrganizations,
  createExampleFeedbacks,
  createExampleFeedbackUsers,
  createExampleInitiatives,
  createExampleProducts,
  createExampleReleases,
} from "@/lib/example";

export const createExampleContent = async (): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("You need to be logged in to create example content.");
    }

    const featureStatuses = await database.featureStatus.findMany({
      select: { id: true },
    });

    const feedbackOrgs =
      await createExampleFeedbackOrganizations(organizationId);
    const feedbackUsers = await createExampleFeedbackUsers(
      organizationId,
      feedbackOrgs
    );
    await createExampleFeedbacks(organizationId, feedbackUsers);
    const products = await createExampleProducts(organizationId, user.id);
    const releases = await createExampleReleases(organizationId, user.id);
    const features = await createExampleFeatures(
      organizationId,
      user.id,
      featureStatuses.map((status) => status.id),
      products,
      releases
    );
    await createExampleChangelogs(organizationId, user.id);
    await createExampleInitiatives(organizationId, user.id, features, products);

    await database.organization.update({
      where: { id: organizationId },
      data: { onboardingType: "EXAMPLE" },
    });

    revalidatePath("/welcome");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
