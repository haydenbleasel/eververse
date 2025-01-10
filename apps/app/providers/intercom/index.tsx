import { env } from '@/env';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { createUserHash } from '@repo/intercom';
import type { ReactNode } from 'react';
import { IntercomClientProvider } from './client';

type IntercomProviderProps = {
  children: ReactNode;
};

export const IntercomProvider = async ({ children }: IntercomProviderProps) => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    return <div />;
  }

  const [userHash, organization, members] = await Promise.all([
    createUserHash(user.id),
    database.organization.findUnique({ where: { id: organizationId } }),
    currentMembers(),
  ]);

  if (!organization) {
    return <div />;
  }

  return (
    <IntercomClientProvider
      user={{
        id: user.id,
        firstName: user.user_metadata.first_name,
        lastName: user.user_metadata.last_name,
        emailAddress: user.email ?? '',
        createdAt: new Date(user.created_at).getTime(),
      }}
      organization={{
        id: organizationId,
        name: organization.name,
      }}
      memberCount={members.length}
      appId={env.INTERCOM_APP_ID}
      userHash={userHash}
    >
      {children}
    </IntercomClientProvider>
  );
};
