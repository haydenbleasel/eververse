'use client';

import type { ReactNode } from 'react';
import { IntercomProvider as Intercom } from 'react-use-intercom';

type IntercomClientProviderProperties = {
  readonly user: {
    readonly id: string;
    readonly firstName: string | null;
    readonly lastName: string | null;
    readonly emailAddress: string;
    readonly createdAt: number;
  };
  readonly organization: {
    readonly id: string;
    readonly name: string;
  };
  readonly memberCount: number;
  readonly appId: string;
  readonly userHash: string;
  readonly children: ReactNode;
};

export const IntercomClientProvider = ({
  user,
  organization,
  memberCount,
  appId,
  userHash,
  children,
}: IntercomClientProviderProperties) => (
  <Intercom
    appId={appId}
    autoBoot
    autoBootProps={{
      hideDefaultLauncher: true,
      company: {
        companyId: organization.id,
        name: organization.name,
        userCount: memberCount,
      },
      userHash,
      email: user.emailAddress,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      userId: user.id,
      createdAt: user.createdAt,
    }}
  >
    {children}
  </Intercom>
);
