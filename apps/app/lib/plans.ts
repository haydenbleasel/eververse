import "server-only";
import { currentOrganizationId } from "@repo/backend/auth/utils";
import { stripe } from "@repo/payments";
import { env } from "@/env";
import { database } from "@/lib/database";

export type PlanName = "ENTERPRISE" | "FREE" | "PRO";

export const currentPlan = async (): Promise<PlanName> => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    throw new Error("Organization not found");
  }

  const databaseOrganization = await database.organization.findFirst({
    where: { id: organizationId },
  });

  if (!databaseOrganization) {
    throw new Error("Organization not found");
  }

  if (!databaseOrganization.stripeSubscriptionId) {
    return "FREE";
  }

  const subscription = await stripe.subscriptions.retrieve(
    databaseOrganization.stripeSubscriptionId
  );

  const product = subscription.items.data.at(0)?.plan.product;

  if (!product) {
    throw new Error("Product not found");
  }

  const productId = typeof product === "string" ? product : product.id;

  if (productId === env.STRIPE_PRODUCT_ENTERPRISE_ID) {
    return "ENTERPRISE";
  }

  if (productId === env.STRIPE_PRODUCT_PRO_ID) {
    return "PRO";
  }

  return "FREE";
};
