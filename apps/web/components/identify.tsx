"use client";

import { identify } from "@repo/analytics/posthog/client";
import { useUser } from "@repo/backend/hooks/use-user";

export const Identify = () => {
  const user = useUser();

  if (!user || process.env.NODE_ENV === "development") {
    return null;
  }

  identify(user.id, {
    email: user.email,
    name: user.user_metadata.name,
  });

  return null;
};
