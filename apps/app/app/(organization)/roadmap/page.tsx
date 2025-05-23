import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  RoadmapEditor,
  type RoadmapEditorProperties,
} from './components/roadmap-editor';

export const metadata: Metadata = createMetadata({
  title: 'Gantt',
  description: 'See a gantt chart of your organization’s features.',
});

const Roadmap = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    notFound();
  }

  const [allFeatures, features, roadmapEvents, members, organization] =
    await Promise.all([
      database.feature.findMany({
        where: {
          startAt: null,
          endAt: null,
        },
        select: {
          id: true,
          title: true,
          status: {
            select: {
              color: true,
            },
          },
        },
      }),
      database.feature.findMany({
        where: {
          startAt: { not: null },
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          initiatives: {
            select: {
              id: true,
              title: true,
            },
          },
          release: {
            select: {
              id: true,
              title: true,
            },
          },
          ownerId: true,
          status: {
            select: {
              id: true,
              name: true,
              order: true,
              complete: true,
              color: true,
            },
          },
        },
        orderBy: { startAt: 'asc' },
      }),
      database.roadmapEvent.findMany({
        select: {
          id: true,
          text: true,
          date: true,
        },
      }),
      currentMembers(),
      database.organization.findUnique({
        where: {
          id: organizationId,
        },
        select: {
          stripeSubscriptionId: true,
        },
      }),
    ]);

  const promises = features.map(async (feature) => {
    const content = await getJsonColumnFromTable(
      'feature',
      'content',
      feature.id
    );

    const newFeature: RoadmapEditorProperties['features'][0] = {
      ...feature,
      startAt: feature.startAt ?? new Date(),
      content,
    };

    return newFeature;
  });

  const modifiedFeatures = await Promise.all(promises);

  if (!organization) {
    notFound();
  }

  return (
    <RoadmapEditor
      allFeatures={allFeatures}
      features={modifiedFeatures}
      markers={roadmapEvents}
      members={members}
      editable={user.user_metadata.organization_role !== EververseRole.Member}
    />
  );
};

export default Roadmap;
