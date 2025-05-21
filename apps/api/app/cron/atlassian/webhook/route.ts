import { createOauth2Client } from '@repo/atlassian';
import { database } from '@repo/backend/database';
import type { Prisma } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { log } from '@repo/observability/log';
import { NextResponse } from 'next/server';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const GET = async (): Promise<Response> => {
  log.info('🤖 Looking for Atlassian webhooks to renew...');

  // Find installations that have webhooks that were last extended more than 25 days ago
  const atlassianInstallations = await database.atlassianInstallation.findMany({
    where: {
      webhooks: {
        some: {
          lastExtendedAt: {
            lt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          },
        },
      },
      resources: {
        some: {},
      },
    },
    select: {
      id: true,
      accessToken: true,
      resources: {
        select: {
          resourceId: true,
        },
      },
      webhooks: {
        select: {
          id: true,
          webhookId: true,
        },
      },
    },
  });

  const expiringWebhooks = atlassianInstallations
    .filter((installation) => installation.webhooks.length > 0)
    .flatMap((installation) => installation.webhooks);

  if (expiringWebhooks.length === 0) {
    log.error('📰 No expiring webhooks found');
    return NextResponse.json(
      { message: 'No expiring webhooks found' },
      { status: 200 }
    );
  }

  log.info(`📰 Found ${expiringWebhooks.length} expiring webhooks`);

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  const promises = atlassianInstallations.map(async (installation) => {
    const atlassian = await createOauth2Client({
      accessToken: installation.accessToken,
      cloudId: installation.resources[0].resourceId,
    });

    log.info(
      `🔄 Refreshing Atlassian webhooks for installation ${installation.id}, access token: ${installation.accessToken}, cloudId: ${installation.resources[0].resourceId}, webhooks: ${installation.webhooks
        .map((webhook) => webhook.id)
        .join(', ')}`
    );

    const response = await atlassian.PUT('/rest/api/3/webhook/refresh', {
      body: {
        webhookIds: installation.webhooks.map((webhook) => webhook.webhookId),
      },
    });

    if (response.error) {
      const message = `Failed to refresh Atlassian webhooks for installation ${installation.id}: ${response.error.errorMessages?.join(', ')}`;

      log.error(message);

      throw new Error(message);
    }

    for (const webhook of installation.webhooks) {
      const transaction = database.atlassianWebhook.update({
        where: { id: webhook.id },
        data: { lastExtendedAt: new Date() },
      });

      transactions.push(transaction);
    }

    log.info(
      `🔄 Refreshed Atlassian webhooks for installation ${installation.id}`
    );
  });

  try {
    await Promise.all(promises);
    await database.$transaction(transactions);
    return new Response('OK', { status: 200 });
  } catch (error) {
    parseError(error);
    return new Response('Error', { status: 500 });
  }
};
