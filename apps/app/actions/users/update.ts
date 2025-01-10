'use server';

import { EververseRole } from '@repo/backend/auth';
import { createClient } from '@repo/backend/auth/server';
import { currentMembers, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateUserRole = async (
  userId: string,
  role: EververseRole
): Promise<{ error?: string }> => {
  try {
    const supabase = await createClient();
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    if (user.user_metadata.organization_role !== EververseRole.Admin) {
      throw new Error('You are not authorized to update user roles');
    }

    const members = await currentMembers();
    const admins = members.filter(
      (member) => member.user_metadata.organization_role === EververseRole.Admin
    );

    if (admins.length === 1) {
      const [admin] = admins;

      if (admin.id === userId && role !== EververseRole.Admin) {
        throw new Error('There must be at least one admin.');
      }
    }

    const response = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { organization_role: role },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    revalidatePath('/settings/members');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
