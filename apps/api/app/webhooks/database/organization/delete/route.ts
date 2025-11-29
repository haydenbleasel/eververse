import type { Organization } from "@repo/backend/prisma/client";
import { log } from "@repo/observability/log";
import { stripe } from "@repo/payments";

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = "force-dynamic";

type DeletePayload = {
  type: "DELETE";
  table: string;
  schema: string;
  record: null;
  old_record: Organization;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as DeletePayload;

  log.info(`👨‍✈️ Organization ${body.old_record.id} has been deleted`);

  if (body.old_record.stripeSubscriptionId) {
    await stripe.subscriptions.cancel(body.old_record.stripeSubscriptionId, {
      cancellation_details: {
        comment: "Deleted organization",
      },
    });

    log.info(
      `👨‍✈️ Stripe subscription ${body.old_record.stripeSubscriptionId} has been canceled`
    );
  }

  return new Response("Organization deleted", { status: 201 });
};
