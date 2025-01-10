import { env } from '@/env';
import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { log } from '@repo/observability/log';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Processing',
  description: 'Please wait while we process your request.',
});

type IntercomCallbackPageProperties = {
  readonly searchParams: Promise<Record<string, string>>;
};

const IntercomCallbackPage = async (props: IntercomCallbackPageProperties) => {
  const searchParams = await props.searchParams;
  const { code, state } = searchParams;

  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId || !code || !state) {
    notFound();
  }

  const installationState = await database.installationState.count({
    where: {
      id: state,
      platform: 'INTERCOM',
      creatorId: user.id,
    },
  });

  if (!installationState) {
    throw new Error('State parameter is invalid');
  }

  await database.installationState.delete({
    where: { id: state },
    select: { id: true },
  });

  const response = await fetch('https://api.intercom.io/auth/eagle/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      client_id: env.INTERCOM_CLIENT_ID,
      client_secret: env.INTERCOM_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    log.error(`Failed to fetch Intercom access token: ${response.statusText}`);
    throw new Error(response.statusText);
  }

  const data = (await response.json()) as {
    token_type: string;
    access_token: string;
    token: string;
  };

  log.info(`Intercom access token: ${data.access_token}`);

  const me = await fetch('https://api.intercom.io/me', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${data.access_token}`,
    },
  });

  log.info(`Intercom me response: ${me.statusText}`);

  if (!me.ok) {
    log.error(`Failed to fetch Intercom user: ${me.statusText}`);
    throw new Error(me.statusText);
  }

  const userData = (await me.json()) as {
    app: {
      id_code: string;
    };
  };

  const installation = await database.intercomInstallation.create({
    data: {
      organizationId,
      accessToken: data.access_token,
      tokenType: data.token_type,
      creatorId: user.id,
      appId: userData.app.id_code,
    },
    select: {
      organization: {
        select: {
          slug: true,
        },
      },
    },
  });

  return redirect(`/${installation.organization.slug}/settings/integrations`);
};

export default IntercomCallbackPage;
