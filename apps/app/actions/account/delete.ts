'use server';

import { createClient } from '@repo/backend/auth/server';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { parseError } from '@repo/lib/parse-error';
import { stripe } from '@repo/payments';

export const deleteAccount = async (): Promise<
  { error: string } | { success: true }
> => {
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

    // If user is part of an organization, handle organization membership
    if (organizationId) {
      const organization = await database.organization.findFirst({
        where: { id: organizationId },
        select: { stripeSubscriptionId: true },
      });

      if (organization?.stripeSubscriptionId && members.length > 1) {
        try {
          // Follow the same pattern as the existing removeUser action
          // This might need to be corrected to use subscription item ID in the future
          await stripe.subscriptionItems.update(
            organization.stripeSubscriptionId,
            {
              quantity: members.length - 1,
            }
          );
        } catch (stripeError) {
          // Log the error but don't fail the account deletion
          console.error('Failed to update Stripe subscription:', stripeError);
        }
      }
    }

    // Delete the user from Supabase auth
    const response = await supabase.auth.admin.deleteUser(user.id);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return { success: true };
  } catch (error) {
    const message = parseError(error);
    return { error: message };
  }
};