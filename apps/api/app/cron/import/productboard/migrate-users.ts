import { database } from '@repo/backend/database';
import type {
  FeedbackOrganization,
  Prisma,
  ProductboardImport,
} from '@repo/backend/prisma/client';
import { emailRegex } from '@repo/lib/email';
import { getGravatarUrl } from '@repo/lib/gravatar';
import { createClient } from '@repo/productboard';
import { friendlyWords } from 'friendlier-words';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateUsers = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });
  const users = await productboard.GET('/users', {
    params: {
      header: {
        'X-Version': 1,
      },
    },
  });

  if (users.error) {
    throw new Error(users.error.errors.map((error) => error.detail).join(', '));
  }

  if (!users.data.data) {
    throw new Error('No users found');
  }

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      feedbackUsers: { select: { productboardId: true } },
      feedbackOrganizations: { select: { domain: true, id: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const newUsers = users.data.data.filter((user) => {
    const existing = databaseOrganization.feedbackUsers.find(
      ({ productboardId }) => productboardId === user.id
    );

    return !existing && Boolean(user.email);
  });

  const promises = newUsers.map(async (user) => {
    let feedbackOrganization: {
      id: FeedbackOrganization['id'];
      domain: FeedbackOrganization['domain'];
    } | null = null;
    const email = user.email as unknown as string;

    if (emailRegex.test(email)) {
      const [, domain] = email.split('@');
      const matchingCompany = databaseOrganization.feedbackOrganizations.find(
        (existingCompany) => existingCompany.domain === domain
      );

      if (matchingCompany) {
        feedbackOrganization = matchingCompany;
      }
    }

    const data: Prisma.FeedbackUserCreateManyInput = {
      email,
      organizationId,
      name: user.name ?? friendlyWords(2, ' '),
      productboardId: user.id,
      imageUrl: await getGravatarUrl(email),
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
