'use server';

import { database } from '@/lib/database';
import type { Feature } from '@prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type ConnectToLinearProperties = {
  readonly featureId: Feature['id'];
  readonly externalId: string;
  readonly href: string;
};

export const connectToLinear = async ({
  featureId,
  externalId,
  href,
}: ConnectToLinearProperties): Promise<{
  error?: string;
}> => {
  try {
    const linearInstallation = await database.linearInstallation.findFirst({
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!linearInstallation) {
      throw new Error('Linear installation not found');
    }

    await database.featureConnection.create({
      data: {
        featureId,
        externalId,
        href,
        organizationId: linearInstallation.organizationId,
        linearInstallationId: linearInstallation.id,
      },
      select: { id: true },
    });

    revalidatePath('/features', 'page');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
