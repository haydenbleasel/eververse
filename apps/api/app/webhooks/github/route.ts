import { database } from '@repo/backend/database';
import type { EmitterWebhookEvent } from '@repo/github/webhooks';
import { log } from '@repo/observability/log';
import { NextResponse } from 'next/server';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const handleIssuesEvent = async (
  event: EmitterWebhookEvent<'issues'>['payload']
) => {
  log.info('🧑‍💻 Received GitHub Issue event', event);

  /*
   * if (!event.installation) {
   *   log.error('Missing installation ID on event');
   *   return NextResponse.json(
   *     { message: 'Missing installation ID on event' },
   *     { status: 400 }
   *   );
   * }
   */

  /*
   * const installation = await database.installation.findFirst({
   *   where: { installationId: `${event.installation.id}` },
   * });
   */

  /*
   * if (!installation) {
   *   log.error('Installation not found');
   *   return NextResponse.json(
   *     { message: 'Installation not found' },
   *     { status: 404 }
   *   );
   * }
   */

  const featureConnection = await database.featureConnection.findFirst({
    where: {
      externalId: `${event.issue.id}`,
      type: 'GITHUB',
    },
    select: {
      id: true,
      featureId: true,
      organizationId: true,
    },
  });

  if (!featureConnection) {
    log.info('🧑‍💻 FeatureConnection not found');
    return NextResponse.json(
      { message: 'FeatureConnection not found' },
      { status: 200 }
    );
  }

  const installationStatusMapping =
    await database.installationStatusMapping.findFirst({
      where: {
        organizationId: featureConnection.organizationId,
        eventType: event.action,
        type: 'GITHUB',
      },
      select: { featureStatusId: true },
    });

  if (!installationStatusMapping) {
    log.error('🧑‍💻 GitHub InstallationStatusMapping not found');
    return NextResponse.json(
      { message: 'Installation status mapping not found' },
      { status: 200 }
    );
  }

  log.info(
    `🧑‍💻 Updating feature ${featureConnection.featureId} status to ${installationStatusMapping.featureStatusId}`
  );

  await database.feature.update({
    where: { id: featureConnection.featureId },
    data: {
      title: event.issue.title,
      statusId: installationStatusMapping.featureStatusId,
    },
    select: { id: true },
  });

  return NextResponse.json(
    { message: '🧑‍💻 Unhandled GitHub Issue event' },
    { status: 200 }
  );
};

export const POST = async (request: Request): Promise<Response> => {
  const id = request.headers.get('X-GitHub-Hook-ID');
  const name = request.headers.get('X-GitHub-Event') as
    | EmitterWebhookEvent['name']
    | null;
  const event = (await request.json()) as EmitterWebhookEvent['payload'] | null;

  if (!id || !name || !event) {
    log.error('🧑‍💻 Invalid GitHub webhook', { id, name, event });
    return NextResponse.json(
      { message: 'Invalid GitHub webhook' },
      { status: 400 }
    );
  }

  if (name === 'issues') {
    return handleIssuesEvent(event as EmitterWebhookEvent<'issues'>['payload']);
  }

  return NextResponse.json({ message: 'Unhandled event' }, { status: 200 });
};
