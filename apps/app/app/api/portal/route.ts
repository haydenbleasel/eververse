import type { NextRequest } from "next/server";
import { database } from "@/lib/database";
import { getPortalUrl } from "@/lib/portal";

export const GET = async (request: NextRequest): Promise<Response> => {
  const parameters = new URL(request.url).searchParams;
  const featureId = parameters.get("feature");

  if (!featureId) {
    return new Response("Missing featureId", { status: 400 });
  }

  const portalFeature = await database.portalFeature.findFirst({
    where: { featureId },
  });

  if (!portalFeature) {
    return new Response("Feature not found", { status: 404 });
  }

  const portalUrl = await getPortalUrl(portalFeature.id);

  return Response.redirect(portalUrl);
};
