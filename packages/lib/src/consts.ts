export const FEEDBACK_PAGE_SIZE = 20;
export const CRON_PAGE_SIZE = 20;

export const MAX_FREE_MEMBERS = 1;
export const MAX_FREE_FEEDBACK = 250;
export const MAX_FREE_FEATURES = 150;
export const MAX_FREE_CHANGELOGS = 5;
export const MAX_FREE_INITIATIVES = 5;
export const MAX_FREE_INITIATIVE_PAGES = 5;
export const MAX_FREE_INITIATIVE_UPDATES = 5;
export const MAX_FREE_RELEASES = 5;

if (!process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
  throw new Error("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL is not defined.");
}

const protocol =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL.endsWith(".local")
    ? "https"
    : "http";
export const baseUrl = new URL(
  `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
).toString();

export const BLOG_POST_PAGE_SIZE = 12;
