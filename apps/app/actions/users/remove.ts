'use server';

import { EververseRole } from '@repo/backend/auth';
import { createClient } from '@repo/backend/auth/server';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { parseError } from '@repo/lib/parse-error';
import { stripe } from '@repo/payments';
import { revalidatePath } from 'next/cache';

export const removeUser = async (
  userId: string
): Promise<{ error: string } | { message: string }> => {
  try {
    const [user, organizationId, members, supabase] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
      currentMembers(),
      createClient(),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.user_metadata.organization_role !== EververseRole.Admin) {
      throw new Error('You are not authorized to delete users');
    }

    if (!organizationId) {
      throw new Error('Not logged in');
    }

    const organization = await database.organization.findFirst({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const response = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        organization_id: null,
        organization_role: null,
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (organization.stripeSubscriptionId) {
      await stripe.subscriptionItems.update(organization.stripeSubscriptionId, {
        quantity: members.length - 1,
      });
    }

    revalidatePath('/settings/members');

    return { message: 'Member removed successfully' };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
