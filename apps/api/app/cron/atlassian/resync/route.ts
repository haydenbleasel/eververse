import type { release_state } from '@prisma/client';
import { createOauth2Client } from '@repo/atlassian';
import { database } from '@repo/backend/database';
import { parseError } from '@repo/lib/parse-error';
import { log } from '@repo/observability/log';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const fieldsSchema = z.object({
  summary: z.string(),
  status: z.object({
    id: z.string(),
  }),
  fixVersions: z.array(
    z.object({
      self: z.string().url(),
      id: z.string(),
      description: z.string().optional(),
      name: z.string(),
      archived: z.boolean(),
      released: z.boolean(),
      releaseDate: z.string().optional(),
    })
  ),
  description: z.unknown(),
});

const handleIssueEvent = async (feature: {
  id: string;
  connection: {
    atlassianInstallationId: string | null;
    externalId: string;
  } | null;
}) => {
  if (!feature.connection || !feature.connection.atlassianInstallationId) {
    return;
  }

  const webhooks = await database.atlassianWebhook.findMany({
    where: {
      installationId: feature.connection.atlassianInstallationId,
    },
    select: {
      id: true,
      organizationId: true,
      resourceId: true,
      installation: {
        select: {
          accessToken: true,
        },
      },
    },
  });

  const webhook = webhooks.at(0);

  if (!webhook) {
    return NextResponse.json({ message: 'No webhooks found' }, { status: 404 });
  }

  if (!webhook.resourceId || !webhook.installation.accessToken) {
    return NextResponse.json(
      { message: 'No resourceId or accessToken found' },
      { status: 404 }
    );
  }

  const atlassian = await createOauth2Client({
    accessToken: webhook.installation.accessToken,
    cloudId: webhook.resourceId,
  });

  const issue = await atlassian.GET('/rest/api/3/issue/{issueIdOrKey}', {
    params: {
      path: {
        issueIdOrKey: feature.connection.externalId,
      },
      query: {
        fields: ['summary', 'status', 'fixVersions', 'description'],
      },
    },
  });

  if (issue.error) {
    throw new Error(`Failed to get issue: ${feature.connection.externalId}`);
  }

  if (!issue.data.fields) {
    throw new Error(
      `Issue response does not contain fields: ${feature.connection.externalId}`
    );
  }

  const validationResult = fieldsSchema.safeParse(issue.data.fields);

  if (!validationResult.success) {
    log.error('Invalid issue fields', {
      errors: validationResult.error.errors,
    });
    throw new Error(
      `Invalid issue fields for issue: ${feature.connection.externalId}`
    );
  }

  const featureConnection = await database.featureConnection.findFirst({
    where: {
      externalId: feature.connection.externalId,
      atlassianInstallationId: {
        not: null,
      },
      organizationId: webhook.organizationId,
    },
    select: {
      id: true,
      featureId: true,
      organizationId: true,
      atlassianInstallationId: true,
    },
  });

  if (!featureConnection) {
    log.info('🧑‍💻 FeatureConnection not found');
    return NextResponse.json(
      { message: 'FeatureConnection not found' },
      { status: 200 }
    );
  }

  // Fields to potentially update
  let releaseId: string | undefined;
  let statusId: string | undefined;
  const title = validationResult.data.summary;

  const fixVersion = validationResult.data.fixVersions.at(0);

  if (fixVersion) {
    log.info(
      `🧑‍💻 Updating release version for feature ${featureConnection.featureId}`
    );

    let existingRelease = await database.release.findFirst({
      where: {
        jiraId: fixVersion.id,
        organizationId: featureConnection.organizationId,
      },
      select: {
        id: true,
      },
    });

    let state: release_state | undefined;

    if (fixVersion.released) {
      state = 'COMPLETED';
    } else if (fixVersion.archived) {
      state = 'CANCELLED';
    }

    if (existingRelease) {
      await database.release.update({
        where: {
          organizationId: featureConnection.organizationId,
          jiraId: fixVersion.id,
        },
        data: {
          title: fixVersion.name,
          description: fixVersion.description,
          endAt: fixVersion.releaseDate
            ? new Date(fixVersion.releaseDate)
            : undefined,
          state,
        },
        select: {
          id: true,
        },
      });
    } else {
      existingRelease = await database.release.create({
        data: {
          title: fixVersion.name,
          description: fixVersion.description,
          endAt: fixVersion.releaseDate
            ? new Date(fixVersion.releaseDate)
            : undefined,
          jiraId: fixVersion.id,
          state,
          organizationId: featureConnection.organizationId,
        },
        select: {
          id: true,
        },
      });
    }

    releaseId = existingRelease.id;
  }

  log.info(`🧑‍💻 Updating status for feature ${featureConnection.featureId}`);
  const installationStatusMapping =
    await database.installationStatusMapping.findFirst({
      where: {
        organizationId: featureConnection.organizationId,
        eventId: validationResult.data.status.id,
        atlassianInstallationId: featureConnection.atlassianInstallationId,
      },
      select: { featureStatusId: true },
    });

  if (installationStatusMapping) {
    statusId = installationStatusMapping.featureStatusId;
  }

  log.info(
    `🧑‍💻 Updating feature fields: ${JSON.stringify({
      title,
      releaseId,
      statusId,
    })}`
  );
  await database.feature.update({
    where: { id: featureConnection.featureId },
    data: {
      title,
      releaseId,
      statusId,
      content: validationResult.data.description as object,
    },
  });

  return NextResponse.json(
    { message: '🧑‍💻 Issue event handled' },
    { status: 200 }
  );
};

export const POST = async (): Promise<Response> => {
  try {
    const count = await database.feature.count({
      where: {
        updatedAt: {
          // 2 days ago
          lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        connection: {
          atlassianInstallationId: {
            not: null,
          },
        },
      },
    });
    const features = await database.feature.findMany({
      where: {
        updatedAt: {
          // 2 days ago
          lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        connection: {
          atlassianInstallationId: {
            not: null,
          },
        },
      },
      take: 10,
      select: {
        id: true,
        connection: {
          select: {
            atlassianInstallationId: true,
            externalId: true,
          },
        },
      },
    });

    for (const feature of features) {
      await handleIssueEvent(feature);
    }

    log.info(
      `🧑‍💻 Resync completed (${count - features.length} remaining): ${features
        .map((f) => f.id)
        .join(', ')}`
    );

    return NextResponse.json(
      {
        message: `🧑‍💻 Resync completed (${count - features.length} remaining): ${features
          .map((f) => f.id)
          .join(', ')}`,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = parseError(error);

    log.error(message);

    return NextResponse.json({ message }, { status: 500 });
  }
};
