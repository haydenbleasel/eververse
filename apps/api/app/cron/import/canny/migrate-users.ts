import { database } from '@repo/backend/database';
import type {
  CannyImport,
  FeedbackOrganization,
  Prisma,
} from '@repo/backend/prisma/client';
import { Canny } from '@repo/canny';
import { getGravatarUrl } from '@repo/lib/gravatar';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateUsers = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const users = await canny.user.list();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      feedbackUsers: { select: { cannyId: true } },
      feedbackOrganizations: {
        select: { id: true, cannyId: true },
      },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const newUsers = users.filter((user) => {
    const existing = databaseOrganization.feedbackUsers.find(
      ({ cannyId }) => cannyId === user.id
    );

    return !existing && Boolean(user.email);
  });

  const promises = newUsers.map(async (user) => {
    let feedbackOrganization: {
      id: FeedbackOrganization['id'];
      cannyId: FeedbackOrganization['cannyId'];
    } | null = null;

    if (!user.email) {
      throw new Error('User does not have an email');
    }

    if (user.companies.length > 0) {
      const matchingCompany = databaseOrganization.feedbackOrganizations.find(
        (existingCompany) => existingCompany.cannyId === user.companies[0].id
      );

      if (matchingCompany) {
        feedbackOrganization = matchingCompany;
      }
    }

    const data: Prisma.FeedbackUserCreateManyInput = {
      email: user.email,
      organizationId,
      name: user.name,
      cannyId: user.id,
      // Should download and re-upload user.avatarURL
      imageUrl: await getGravatarUrl(user.email),
      feedbackOrganizationId: feedbackOrganization?.id ?? null,
    };

    return data;
  });

  const data = await Promise.all(promises);

  await database.feedbackUser.createMany({
    data,
    skipDuplicates: true,
  });

  return newUsers.length;
};
