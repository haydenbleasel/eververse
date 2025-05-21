import { Sidebar } from '@/components/sidebar';
import { database } from '@/lib/database';
import { IntercomProvider } from '@/providers/intercom';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import {
  SidebarInset,
  SidebarProvider,
} from '@repo/design-system/components/ui/sidebar';
import { MAX_FREE_MEMBERS } from '@repo/lib/consts';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Forms } from './components/forms';
import { Navbar } from './components/navbar';

type OrganizationLayoutProperties = {
  readonly children: ReactNode;
};

const OrganizationLayout = async ({
  children,
}: OrganizationLayoutProperties) => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user) {
    redirect('/sign-in');
  }

  if (!organizationId) {
    redirect('/setup');
  }

  const organization = await database.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  if (!organization.stripeSubscriptionId) {
    const members = await currentMembers();

    if (members.length > MAX_FREE_MEMBERS) {
      redirect('/upgrade');
    }
  }

  return (
    <IntercomProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '220px',
          } as CSSProperties
        }
      >
        <Sidebar user={user} organization={organization} />
        <SidebarInset className="bg-transparent">
          <div className="flex min-h-screen flex-1 flex-col">
            <Navbar />
            {children}
          </div>
        </SidebarInset>
        <Suspense fallback={null}>
          <Forms />
        </Suspense>
      </SidebarProvider>
    </IntercomProvider>
  );
};

export default OrganizationLayout;
