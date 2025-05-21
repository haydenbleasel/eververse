import { AvatarTooltip } from '@/components/avatar-tooltip';
import { database } from '@/lib/database';
import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import {
  currentMembers,
  currentOrganizationId,
} from '@repo/backend/auth/utils';
import type {
  Feature,
  FeatureConnection,
  FeatureStatus,
} from '@repo/backend/prisma/client';
import { Link } from '@repo/design-system/components/link';
import { StackCard } from '@repo/design-system/components/stack-card';
import { formatDate } from '@repo/lib/format';
import { TablePropertiesIcon } from 'lucide-react';
import Image from 'next/image';
import { InitiativeTimeline } from './initiative-timeline';

type InitiativeFeaturesProps = {
  readonly initiativeId: string;
};

const InitiativeFeature = ({
  feature,
  owner,
}: {
  feature: Pick<Feature, 'id' | 'title' | 'ownerId' | 'startAt' | 'endAt'> & {
    status: Pick<FeatureStatus, 'color'>;
    connection: Pick<
      FeatureConnection,
      | 'atlassianInstallationId'
      | 'linearInstallationId'
      | 'githubInstallationId'
    > | null;
  };
  readonly owner: User | undefined;
}) => {
  let featureConnectionSource = null;

  if (feature.connection?.githubInstallationId) {
    featureConnectionSource = '/github.svg';
  } else if (feature.connection?.atlassianInstallationId) {
    featureConnectionSource = '/jira.svg';
  } else if (feature.connection?.linearInstallationId) {
    featureConnectionSource = '/linear.svg';
  }

  return (
    <Link
      key={feature.id}
      className="flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-card"
      href={`/features/${feature.id}`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: feature.status.color }}
      />
      <span className="flex-1 truncate font-medium text-sm">
        {feature.title}
      </span>
      <span className="text-muted-foreground text-sm">
        {feature.startAt && feature.endAt
          ? `${formatDate(feature.startAt)} - ${formatDate(feature.endAt)}`
          : null}
        {feature.startAt && !feature.endAt
          ? `Started ${formatDate(feature.startAt)}`
          : null}
        {feature.endAt && !feature.startAt
          ? `Due ${formatDate(feature.endAt)}`
          : null}
      </span>
      {featureConnectionSource && (
        <Image
          src={featureConnectionSource}
          width={16}
          height={16}
          alt="Feature connection source"
        />
      )}
      {owner ? (
        <AvatarTooltip
          title={getUserName(owner)}
          subtitle={owner.email ?? ''}
          src={owner.user_metadata.image_url}
          fallback={owner.email?.slice(0, 2).toUpperCase() ?? '??'}
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-card" />
      )}
    </Link>
  );
};

export const InitiativeFeatures = async ({
  initiativeId,
}: InitiativeFeaturesProps) => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const [databaseOrganization, members] = await Promise.all([
    database.organization.findFirst({
      where: { id: organizationId },
      select: {
        initiatives: {
          where: {
            id: initiativeId,
          },
          select: {
            title: true,
          },
        },
        features: {
          where: {
            // biome-ignore lint/style/useNamingConvention: "Prisma property"
            OR: [
              {
                initiatives: {
                  some: {
                    id: initiativeId,
                  },
                },
              },
              {
                group: {
                  initiatives: {
                    some: {
                      id: initiativeId,
                    },
                  },
                },
              },
              {
                product: {
                  initiatives: {
                    some: {
                      id: initiativeId,
                    },
                  },
                },
              },
            ],
          },
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
            ownerId: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
            release: {
              select: {
                id: true,
                title: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            status: {
              select: {
                color: true,
                complete: true,
              },
            },
            connection: {
              select: {
                atlassianInstallationId: true,
                linearInstallationId: true,
                githubInstallationId: true,
              },
            },
          },
        },
        groups: {
          where: {
            initiatives: {
              some: {
                id: initiativeId,
              },
            },
          },
          select: {
            id: true,
            name: true,
          },
        },
        products: {
          where: {
            initiatives: {
              some: {
                id: initiativeId,
              },
            },
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    currentMembers(),
  ]);

  if (!databaseOrganization || !databaseOrganization.initiatives) {
    return <div />;
  }

  const uniqueFeatures = databaseOrganization.features.filter(
    (feature, index, self) =>
      index === self.findIndex((f) => f.id === feature.id)
  );

  const roadmapFeatures = uniqueFeatures.filter(
    (feature) => feature.startAt && feature.endAt
  );

  return (
    <>
      {uniqueFeatures.length > 0 && (
        <StackCard
          title="Features"
          icon={TablePropertiesIcon}
          className="max-h-[20rem] w-full overflow-y-auto p-2"
        >
          {uniqueFeatures.map((feature) => (
            <InitiativeFeature
              key={feature.id}
              feature={feature}
              owner={members.find((member) => member.id === feature.ownerId)}
            />
          ))}
        </StackCard>
      )}
      {roadmapFeatures.length > 0 && (
        <InitiativeTimeline
          title={databaseOrganization.initiatives[0].title}
          features={roadmapFeatures as never}
          members={members}
        />
      )}
    </>
  );
};
