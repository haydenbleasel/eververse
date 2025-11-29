"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Widget, WidgetItem } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type CreateWidgetItemProperties = Pick<WidgetItem, "icon" | "name" | "link">;

export const createWidgetItem = async (
  widgetId: Widget["id"],
  properties: CreateWidgetItemProperties
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("User or organization not found");
    }

    const organization = await database.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!organization?.stripeSubscriptionId) {
      throw new Error("Upgrade to to add more items");
    }

    await database.widgetItem.create({
      data: {
        widgetId,
        ...properties,
        creatorId: user.id,
        organizationId: organization.id,
      },
    });

    revalidatePath("/settings/widget");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
