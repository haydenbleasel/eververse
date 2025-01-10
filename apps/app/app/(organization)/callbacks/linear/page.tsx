import { env } from '@/env';
import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { baseUrl } from '@repo/lib/consts';
import { log } from '@repo/observability/log';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Processing',
  description: 'Please wait while we process your request.',
});

type LinearCallbackPageProperties = {
  readonly searchParams: Promise<Record<string, string>>;
};

const LinearCallbackPage = async (props: LinearCallbackPageProperties) => {
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
      platform: 'LINEAR',
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

  const body = new URLSearchParams();

  body.append('code', code);
  body.append('redirect_uri', new URL('/callbacks/linear', baseUrl).toString());
  body.append('client_id', env.LINEAR_CLIENT_ID);
  body.append('client_secret', env.LINEAR_CLIENT_SECRET);
  body.append('grant_type', 'authorization_code');

  const response = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    log.error(`Failed to fetch Linear access token: ${response.statusText}`);
    throw new Error(response.statusText);
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
  };

  const installation = await database.linearInstallation.create({
    data: {
      organizationId,
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      creatorId: user.id,
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

export default LinearCallbackPage;
