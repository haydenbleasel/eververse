import { database } from "@repo/backend/database";
import { LINEAR_WEBHOOK_SIGNATURE_HEADER, LinearClient } from "@repo/linear";

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = "force-dynamic";

type LinearEvent =
  | "Comment"
  | "Cycle"
  | "Issue"
  | "IssueLabel"
  | "Project"
  | "Reaction";

type DataChangeEvent = {
  action: "create" | "remove" | "update";
  data: {
    id: string;
    createdAt: string;
    updatedAt: string;
    archivedAt: null;
    body: string;
    edited: boolean;
    issueId: string;
    userId: string;
  };
  type: LinearEvent;
  url: string;
  createdAt: string;
  webhookTimestamp: number;
  webhookId: string;
};

const linearIps = new Set(["35.231.147.226", "35.243.134.228"]);

const handleIssueUpdate = async (event: DataChangeEvent) => {
  const featureConnection = await database.featureConnection.findFirst({
    where: {
      externalId: event.data.id,
      type: "LINEAR",
    },
    select: {
      id: true,
      featureId: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          linearInstallations: {
            select: {
              apiKey: true,
            },
          },
        },
      },
    },
  });

  if (!featureConnection) {
    return new Response("OK");
  }

  const linearInstallation =
    featureConnection.organization.linearInstallations.at(0);

  if (!linearInstallation) {
    return new Response("OK");
  }

  const linear = new LinearClient({
    apiKey: linearInstallation.apiKey,
  });
  const linearIssue = await linear.issue(event.data.issueId);

  await database.feature.update({
    where: { id: featureConnection.featureId },
    data: { title: linearIssue.title },
  });

  return new Response("OK");
};

const handleIssueRemove = async (event: DataChangeEvent) => {
  const featureConnection = await database.featureConnection.findFirst({
    where: {
      externalId: event.data.id,
      type: "LINEAR",
    },
    select: {
      id: true,
      featureId: true,
      organizationId: true,
    },
  });

  if (!featureConnection) {
    return new Response("OK");
  }

  const completedFeatureStatus = await database.featureStatus.findFirst({
    where: {
      organizationId: featureConnection.organizationId,
      complete: true,
    },
    select: {
      id: true,
    },
  });

  if (!completedFeatureStatus) {
    return new Response("OK");
  }

  await database.feature.update({
    where: { id: featureConnection.featureId },
    data: { statusId: completedFeatureStatus.id },
  });

  return new Response("OK");
};

const handleIssueEvent = (event: DataChangeEvent) => {
  switch (event.action) {
    case "update": {
      return handleIssueUpdate(event);
    }
    case "remove": {
      return handleIssueRemove(event);
    }
    default: {
      return new Response("OK");
    }
  }
};

export const POST = async (request: Request): Promise<Response> => {
  const text = await request.text();
  const signature = request.headers.get(LINEAR_WEBHOOK_SIGNATURE_HEADER);
  const ip = request.headers.get("x-forwarded-for");
  const body = JSON.parse(text) as DataChangeEvent;

  // Validate request IP
  if (ip && !linearIps.has(ip)) {
    return new Response("Invalid request", { status: 400 });
  }

  // Ensure signature is present
  if (!signature) {
    return new Response("Invalid request", { status: 400 });
  }

  if (body.type === "Issue") {
    return handleIssueEvent(body);
  }

  return new Response("OK");
};
