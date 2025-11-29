import { NextResponse } from "next/server";
import { env } from "@/env";

const githubAppSlug = env.GITHUB_APP_SLUG;

export const GET = (): Response =>
  NextResponse.redirect(
    `https://github.com/apps/${githubAppSlug}/installations/new`
  );
