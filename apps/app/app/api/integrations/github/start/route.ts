import { env } from '@/env';
import { NextResponse } from 'next/server';

const githubAppSlug = env.GITHUB_APP_SLUG;

export const GET = (): Response =>
  NextResponse.redirect(
    `https://github.com/apps/${githubAppSlug}/installations/new`
  );
