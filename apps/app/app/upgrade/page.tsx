import { removeUser } from '@/actions/users/remove';
import { env } from '@/env';
import { EververseRole } from '@repo/backend/auth';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { Logo } from '@repo/design-system/components/logo';
import { Button } from '@repo/design-system/components/ui/button';
import { MAX_FREE_MEMBERS } from '@repo/lib/consts';
import { pluralize } from '@repo/lib/pluralize';
import { stripe } from '@repo/payments';
import { createMetadata } from '@repo/seo/metadata';
import { ChevronsDownIcon, SparklesIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const title = 'Time to upgrade';
const description =
  "Thanks for trying Eververse! You've reached the limit of users on the free plan.";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Upgrade = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    notFound();
  }

  const members = await currentMembers();

  if (members.length <= MAX_FREE_MEMBERS) {
    redirect('/');
  }

  const price = await stripe.prices.list({
    active: true,
    product: env.STRIPE_PRODUCT_PRO_ID,
  });

  const monthlyPrice = price.data.find(
    (p) => p.recurring?.interval === 'month'
  );

  if (!monthlyPrice) {
    notFound();
  }

  const removeUsers = async () => {
    'use server';

    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    const members = await currentMembers();
    const users = members.filter((member) => member.id !== user.id);

    for (const user of users) {
      const response = await removeUser(user.id);

      if ('error' in response) {
        throw new Error(response.error);
      }
    }

    redirect('/');
  };

  if (user.user_metadata.organization_role !== EververseRole.Admin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 py-16">
        <Logo />
        <h1 className="mt-4 max-w-md text-center font-semibold text-2xl text-foreground">
          {title}
        </h1>
        <p className="max-w-sm text-center text-muted-foreground">
          {description} To continue, please ask your organization admin to
          upgrade to a paid plan or remove some users.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 py-16">
      <Logo />
      <h1 className="mt-4 max-w-md text-center font-semibold text-2xl text-foreground">
        Time to upgrade
      </h1>
      <p className="max-w-sm text-center text-muted-foreground">
        {description} To continue, please upgrade to a paid plan or remove some
        users.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <Button asChild>
          <Link
            href={`/api/stripe/checkout?priceId=${monthlyPrice.id}`}
            className="flex items-center gap-2"
          >
            <SparklesIcon size={16} />
            <span>Subscribe</span>
          </Link>
        </Button>
        <form action={removeUsers}>
          <Button
            variant="outline"
            type="submit"
            className="flex items-center gap-2"
          >
            <ChevronsDownIcon size={16} />
            Remove users
          </Button>
        </form>
      </div>
      <small className="max-w-[16rem] text-center text-muted-foreground">
        You currently have {pluralize('user', members.length, true)}. You can
        only have {pluralize('user', MAX_FREE_MEMBERS, true)} on the free plan.
      </small>
    </div>
  );
};

export default Upgrade;
