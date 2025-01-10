'use server';

import { database } from '@/lib/database';
import type {
  AiFeatureRice,
  Feature,
  FeatureConnection,
  FeatureRice,
  FeatureStatus,
  Group,
  PortalFeature,
  Prisma,
  Product,
} from '@prisma/client';
import { FEEDBACK_PAGE_SIZE } from '@repo/lib/consts';

export type GetFeaturesResponse = (Pick<
  Feature,
  'createdAt' | 'id' | 'title' | 'ownerId'
> & {
  rice: Pick<FeatureRice, 'confidence' | 'effort' | 'impact' | 'reach'> | null;
  aiRice: Pick<
    AiFeatureRice,
    'confidence' | 'effort' | 'impact' | 'reach'
  > | null;
  connection: Pick<
    FeatureConnection,
    | 'atlassianInstallationId'
    | 'githubInstallationId'
    | 'href'
    | 'linearInstallationId'
  > | null;
  status: Pick<FeatureStatus, 'color' | 'complete' | 'id' | 'name' | 'order'>;
  product: Pick<Product, 'name'> | null;
  group: Pick<Group, 'name' | 'parentGroupId'> | null;
  portalFeature: Pick<PortalFeature, 'portalId'> | null;
  _count: {
    feedback: number;
  };
  meta: {
    total: number;
  };
})[];

export const getFeatures = async (
  page: number,
  query?: Partial<Prisma.FeatureWhereInput>
): Promise<
  | {
      data: GetFeaturesResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const [total, features] = await Promise.all([
      database.feature.count({
        where: query,
      }),
      database.feature.findMany({
        where: query,
        orderBy: { createdAt: 'desc' },
        skip: page * FEEDBACK_PAGE_SIZE,
        take: FEEDBACK_PAGE_SIZE,
        select: {
          id: true,
          title: true,
          createdAt: true,
          ownerId: true,
          portalFeature: {
            select: {
              portalId: true,
            },
          },
          rice: {
            select: {
              reach: true,
              impact: true,
              confidence: true,
              effort: true,
            },
          },
          aiRice: {
            select: {
              reach: true,
              impact: true,
              confidence: true,
              effort: true,
            },
          },
          connection: {
            select: {
              href: true,
              githubInstallationId: true,
              atlassianInstallationId: true,
              linearInstallationId: true,
            },
          },
          status: {
            select: {
              id: true,
              color: true,
              order: true,
              complete: true,
              name: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
          group: {
            select: {
              name: true,
              parentGroupId: true,
            },
          },
          _count: {
            select: {
              feedback: true,
            },
          },
        },
      }),
    ]);

    const data: GetFeaturesResponse = features.map((feature) => ({
      ...feature,
      meta: {
        total,
      },
    }));

    return { data };
  } catch (error) {
    return { error };
  }
};
