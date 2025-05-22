import { identify } from '@repo/analytics/posthog/client';
import { currentUser } from '@repo/backend/auth/utils';

export const Identify = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  identify(user.id, {
    email: user.email,
    name: user.user_metadata.name,
  });

  return null;
};
