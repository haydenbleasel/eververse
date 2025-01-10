import { Sidebar } from '@/components/sidebar';
import { database } from '@/lib/database';
import { IntercomProvider } from '@/providers/intercom';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { MAX_FREE_MEMBERS } from '@repo/lib/consts';
import { stripe } from '@repo/payments';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
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

  if (organization.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.retrieve(organization.stripeSubscriptionId);
    } catch (error) {
      console.log(error);

      await database.organization.update({
        where: { id: organizationId },
        data: { stripeSubscriptionId: null },
      });
    }
  } else {
    const members = await currentMembers();

    if (members.length > MAX_FREE_MEMBERS) {
      redirect('/upgrade');
    }
  }

  return (
    <IntercomProvider>
      <SidebarProvider
        style={{
          // @ts-expect-error --sidebar-width is a custom property
          '--sidebar-width': '220px',
        }}
      >
        <Sidebar user={user} organization={organization} />
        <main className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          {children}
        </main>
        <Suspense fallback={null}>
          <Forms />
        </Suspense>
      </SidebarProvider>
    </IntercomProvider>
  );
};

export default OrganizationLayout;
