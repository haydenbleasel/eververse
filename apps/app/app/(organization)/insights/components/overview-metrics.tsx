import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { Link } from '@repo/design-system/components/link';
import { StackCard } from '@repo/design-system/components/stack-card';

export const OverviewMetrics = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    return <div />;
  }

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      features: {
        select: {
          id: true,
          ownerId: true,
          createdAt: true,
          status: {
            select: {
              id: true,
              complete: true,
            },
          },
        },
      },
      feedback: {
        where: {
          processed: false,
        },
        select: {
          id: true,
        },
      },
      releases: {
        where: {
          endAt: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!databaseOrganization) {
    return <div />;
  }

  const closedStatuses = new Set<string>();
  const openStatuses = new Set<string>();

  for (const feature of databaseOrganization.features) {
    if (feature.status.complete) {
      closedStatuses.add(feature.status.id);
    } else {
      openStatuses.add(feature.status.id);
    }
  }

  const openFeatures = databaseOrganization.features.filter((feature) =>
    openStatuses.has(feature.status.id)
  );
  const yourFeatures = databaseOrganization.features.filter(
    (feature) => feature.ownerId === user.id
  );

  const openFeaturesSearchParams = new URLSearchParams();
  openFeaturesSearchParams.set('id', 'status');
  openFeaturesSearchParams.set(
    'value',
    `[${Array.from(openStatuses)
      .map((status) => `"${status}"`)
      .join(',')}]`
  );

  const closedFeaturesSearchParams = new URLSearchParams();
  closedFeaturesSearchParams.set('id', 'status');
  closedFeaturesSearchParams.set(
    'value',
    `[${Array.from(closedStatuses)
      .map((status) => `"${status}"`)
      .join(',')}]`
  );

  const yourFeaturesSearchParams = new URLSearchParams();
  yourFeaturesSearchParams.set('id', 'owner');
  yourFeaturesSearchParams.set('value', `["${user.id}"]`);

  const cards = [
    {
      title: 'Open Features',
      count: openFeatures.length,
      href: `/features?${openFeaturesSearchParams.toString()}`,
    },
    {
      title: 'New Feedback',
      count: databaseOrganization.feedback.length,
      href: '/feedback',
    },
    {
      title: 'Upcoming Releases',
      count: databaseOrganization.releases.length,
      href: '/releases',
    },
    {
      title: 'Your Features',
      count: yourFeatures.length,
      href: `/features?${yourFeaturesSearchParams.toString()}`,
    },
  ];

  return (
    <StackCard className="grid divide-y p-0 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
      {cards.map((card) => (
        <Link
          key={card.title}
          className="flex flex-col items-center gap-1 p-4 transition-colors hover:bg-card"
          href={card.href}
        >
          <p className="m-0 text-center font-semibold text-lg">{card.count}</p>
          <p className="m-0 text-center text-muted-foreground text-sm">
            {card.title}
          </p>
        </Link>
      ))}
    </StackCard>
  );
};
