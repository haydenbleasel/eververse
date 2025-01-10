import { env } from '@/env';
import { database } from '@repo/backend/database';
import { log } from '@repo/observability/log';
import { NextResponse } from 'next/server';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const GET = async (): Promise<Response> => {
  log.info('🤖 Looking for Atlassian access tokens to renew...');

  // Find access tokens that will expire in the next 12 hours
  const atlassianInstallations = await database.atlassianInstallation.findMany({
    where: {
      expiresAt: {
        lte: new Date(Date.now() + 12 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      refreshToken: true,
    },
  });

  if (atlassianInstallations.length === 0) {
    log.error('📰 No expiring access tokens found');
    return NextResponse.json(
      { message: 'No expiring access tokens found' },
      { status: 200 }
    );
  }

  log.info(`📰 Found ${atlassianInstallations.length} expiring access tokens`);

  const promises = atlassianInstallations.map(async (installation) => {
    const response = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: env.ATLASSIAN_CLIENT_ID,
        client_secret: env.ATLASSIAN_CLIENT_SECRET,
        refresh_token: installation.refreshToken,
      }),
    });

    if (!response.ok) {
      log.error(
        `Failed to refresh Atlassian access token for installation ${installation.id}: ${response.statusText}`
      );
      return;
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
    };

    await database.atlassianInstallation.update({
      where: { id: installation.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        scope: data.scope,
      },
    });

    log.info(`🔄 Refreshed access token for installation ${installation.id}`);
  });

  await Promise.all(promises);

  return new Response('OK', { status: 200 });
};
