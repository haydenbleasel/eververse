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

export const deleteOrganization = async (): Promise<
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

    if (user.user_metadata.organization_role !== EververseRole.Admin) {
      throw new Error('You are not authorized to delete this organization');
    }

    if (!organizationId) {
      throw new Error('Organization not found');
    }

    // Check if organization exists
    const organization = await database.organization.findFirst({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Remove organization association from all members
    const updatePromises = members.map((member) =>
      supabase.auth.admin.updateUserById(member.id, {
        user_metadata: {
          organization_id: null,
          organization_role: null,
        },
      })
    );

    await Promise.all(updatePromises);

    // Delete the organization from the database
    // This will trigger the webhook that handles Stripe subscription cancellation
    await database.organization.delete({
      where: { id: organizationId },
    });

    return { success: true };
  } catch (error) {
    const message = parseError(error);
    return { error: message };
  }
};