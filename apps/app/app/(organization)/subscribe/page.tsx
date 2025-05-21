import { database } from '@/lib/database';
import { currentPlan } from '@/lib/plans';
import { EververseRole } from '@repo/backend/auth';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import Climate from '@repo/design-system/components/climate';
import { stripe } from '@repo/payments';
import { createMetadata } from '@repo/seo/metadata';
import { CircleArrowUpIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import pluralize from 'pluralize';
import { Plans } from './components/plans';

export const metadata: Metadata = createMetadata({
  title: 'Subscribe',
  description:
    'Choose a plan that works for you. All plans include a 14-day free trial.',
});

const Subscribe = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (
    !user ||
    !organizationId ||
    user.user_metadata.organization_role !== EververseRole.Admin
  ) {
    notFound();
  }

  const [plan, databaseOrganization, products, prices, members] =
    await Promise.all([
      currentPlan(),
      database.organization.findFirst({
        where: { id: organizationId },
      }),
      stripe.products.list({ active: true }),
      stripe.prices.list({ active: true }),
      currentMembers(),
    ]);

  if (!databaseOrganization || products.data.length === 0) {
    notFound();
  }

  return (
    <div className="w-full px-6 py-16">
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <div className="flex flex-col items-center text-center">
          <CircleArrowUpIcon size={48} className="text-primary" />
          <div className="grid gap-2">
            <h1 className="mt-4 mb-2 text-3xl">Upgrade your team</h1>
            <p>
              Choose a plan that works for you. All plans include a{' '}
              <span className="font-semibold text-primary">
                15-day free trial
              </span>
              .
            </p>
          </div>
        </div>
        <Plans
          products={products.data}
          currentPlan={plan}
          prices={prices.data}
        />
        <p className="text-center text-muted-foreground text-sm">
          You currently have {pluralize('user', members.length, true)} in your
          organization.
        </p>
        <div className="flex items-center justify-center">
          <Climate />
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
