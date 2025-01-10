import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { redirect } from 'next/navigation';

export const handleAuthedState = async (): Promise<void> => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user) {
    return;
  }

  if (!organizationId) {
    redirect('/setup');
  }
};
