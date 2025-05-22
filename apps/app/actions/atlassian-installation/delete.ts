'use server';

import { database } from '@/lib/database';
import { createOauth2Client } from '@repo/atlassian';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { log } from '@repo/observability/log';

export const deleteAtlassianInstallation = async (): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        'You do not have permission to delete Atlassian installations'
      );
    }

    const atlassianInstallation =
      await database.atlassianInstallation.findFirst({
        select: {
          id: true,
          accessToken: true,
          resources: {
            select: {
              resourceId: true,
              webhooks: {
                select: {
                  webhookId: true,
                },
              },
            },
          },
        },
      });

    if (!atlassianInstallation) {
      throw new Error('Installation not found');
    }

    try {
      await Promise.all(
        atlassianInstallation.resources.map(async (resource) => {
          const response = await createOauth2Client({
            cloudId: resource.resourceId,
            accessToken: atlassianInstallation.accessToken,
          }).DELETE('/rest/api/2/webhook', {
            body: {
              webhookIds: resource.webhooks.map((webhook) => webhook.webhookId),
            },
          });

          if (response.error) {
            throw new Error(
              `Failed to deregister webhooks: ${response.error.errorMessages?.join(
                ', '
              )}`
            );
          }
        })
      );
    } catch (error) {
      log.error(`Failed to deregister webhooks: ${error}`);
    }

    await database.atlassianInstallation.delete({
      where: { id: atlassianInstallation.id },
      select: { id: true },
    });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
