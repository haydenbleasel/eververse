import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import { createClient } from '@repo/backend/auth/server';
import { database } from '@repo/backend/database';
import { log } from '@repo/observability/log';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: User;
  old_record: User;
};

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: User;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as UpdatePayload | InsertPayload;

  log.info('👨‍✈️ User has been updated or inserted');

  const client = await createClient();
  const user = await client.auth.admin.getUserById(body.record.id);
  const organization = await database.organization.findUnique({
    where: { id: body.record.user_metadata.organization_id },
    select: { name: true },
  });

  if (user.error) {
    throw user.error;
  }

  if (!user.data.user || !user.data.user.email || !organization) {
    return new Response('User or organization not found', { status: 404 });
  }

  const userName = getUserName(user.data.user);
  const [, domain] = user.data.user.email.split('@');

  let feedbackOrganization = await database.feedbackOrganization.findFirst({
    where: {
      organizationId: body.record.user_metadata.organization_id,
      domain,
      name: organization.name,
    },
    select: { id: true },
  });

  if (!feedbackOrganization) {
    feedbackOrganization = await database.feedbackOrganization.create({
      data: {
        name: organization.name,
        domain,
        organizationId: body.record.user_metadata.organization_id,
      },
      select: { id: true },
    });
  }

  const existingFeedbackUser = await database.feedbackUser.findFirst({
    where: {
      email: user.data.user.email,
      organizationId: body.record.user_metadata.organization_id,
    },
    select: { id: true },
  });

  if (!existingFeedbackUser) {
    await database.feedbackUser.create({
      data: {
        email: user.data.user.email,
        name: userName,
        imageUrl: user.data.user.user_metadata.image_url,
        organizationId: body.record.user_metadata.organization_id,
        feedbackOrganizationId: feedbackOrganization.id,
      },
      select: { id: true },
    });
  }

  return new Response('Membership updated', { status: 201 });
};
