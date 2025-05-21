import { database } from '@repo/backend/database';
import type {
  Prisma,
  ProductboardImport,
  release_state,
} from '@repo/backend/prisma/client';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateReleases = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const releases = await productboard.release.list();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      releases: { select: { productboardId: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const data: Prisma.ReleaseCreateManyInput[] = [];
  const newReleases = releases.filter((release) => {
    const doesExist = databaseOrganization.releases.find(
      ({ productboardId }) => productboardId === release.id
    );

    return !doesExist;
  });

  for (const release of newReleases) {
    const startAt =
      release.timeframe.startDate === 'none'
        ? undefined
        : new Date(release.timeframe.startDate);
    const endAt =
      release.timeframe.endDate === 'none'
        ? undefined
        : new Date(release.timeframe.endDate);

    let state: release_state = 'PLANNED';

    if (release.state === 'completed') {
      state = 'COMPLETED';
    } else if (release.state === 'in-progress') {
      state = 'ACTIVE';
    }

    data.push({
      organizationId,
      productboardId: release.id,
      title: release.name,
      description: release.description,
      startAt,
      endAt,
      state,
      createdAt: startAt,
    });
  }

  await database.release.createMany({
    data,
    skipDuplicates: true,
  });

  return data.length;
};
