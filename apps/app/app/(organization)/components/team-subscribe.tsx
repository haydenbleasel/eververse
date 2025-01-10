import { EververseRole } from '@repo/backend/auth';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { Link } from '@repo/design-system/components/link';
import { Button } from '@repo/design-system/components/ui/button';
import { CircleFadingArrowUp } from 'lucide-react';
import { Team } from './team';

export const TeamSubscribe = async () => {
  const [user, organizationId, members] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
    currentMembers(),
  ]);

  if (!user || !organizationId) {
    return null;
  }

  const organization = await database.organization.findFirst({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    return null;
  }

  if (
    !organization.stripeSubscriptionId &&
    user.user_metadata.organization_role === EververseRole.Admin
  ) {
    return (
      <Button variant="link" asChild size="sm">
        <Link href="/subscribe" className="flex items-center gap-2">
          <CircleFadingArrowUp size={14} className="shrink-0" />
          <span>
            Upgrade <span className="hidden sm:inline">your team</span>
          </span>
        </Link>
      </Button>
    );
  }

  if (user.user_metadata.organization_role === EververseRole.Member) {
    return null;
  }

  return (
    <div className="px-2">
      <Team user={user} organizationId={organization.id} members={members} />
    </div>
  );
};
