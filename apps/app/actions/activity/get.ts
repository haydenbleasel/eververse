'use server';

import { database } from '@/lib/database';
import type {
  ApiKey,
  Changelog,
  Feature,
  Feedback,
  FeedbackFeatureLink,
  FeedbackOrganization,
  FeedbackUser,
  Group,
  Initiative,
  InitiativeCanvas,
  InitiativeExternalLink,
  InitiativeMember,
  InitiativePage,
  PortalFeature,
  Product,
  Release,
  WidgetItem,
} from '@prisma/client';
import { getUserName } from '@repo/backend/auth/format';
import {
  currentMembers,
  currentOrganizationId,
} from '@repo/backend/auth/utils';
import { subDays } from 'date-fns';

export type GetActivityResponse = {
  initiatives: Pick<Initiative, 'createdAt' | 'creatorId' | 'id' | 'title'>[];
  initiativeMembers: (Pick<
    InitiativeMember,
    'createdAt' | 'creatorId' | 'id' | 'userId'
  > & {
    initiative: Pick<Initiative, 'id' | 'title'>;
  })[];
  initiativePages: (Pick<
    InitiativePage,
    'createdAt' | 'creatorId' | 'id' | 'title'
  > & {
    initiative: Pick<Initiative, 'id' | 'title'>;
  })[];
  initiativeCanvases: (Pick<
    InitiativeCanvas,
    'createdAt' | 'creatorId' | 'id' | 'title'
  > & {
    initiative: Pick<Initiative, 'id' | 'title'>;
  })[];
  initiativeExternalLinks: (Pick<
    InitiativeExternalLink,
    'createdAt' | 'creatorId' | 'href' | 'id' | 'title'
  > & {
    initiative: Pick<Initiative, 'id' | 'title'>;
  })[];
  feedback: (Pick<Feedback, 'createdAt' | 'id' | 'source' | 'title'> & {
    feedbackUser:
      | (Pick<FeedbackUser, 'imageUrl' | 'name'> & {
          feedbackOrganization: Pick<FeedbackOrganization, 'name'> | null;
        })
      | null;
  })[];
  products: Pick<Product, 'createdAt' | 'creatorId' | 'id' | 'name'>[];
  groups: Pick<Group, 'createdAt' | 'creatorId' | 'id' | 'name'>[];
  features: Pick<
    Feature,
    'createdAt' | 'creatorId' | 'id' | 'source' | 'title'
  >[];
  changelog: Pick<Changelog, 'createdAt' | 'creatorId' | 'id' | 'title'>[];
  apiKeys: Pick<ApiKey, 'createdAt' | 'creatorId' | 'id' | 'name'>[];
  feedbackFeatureLinks: (Pick<
    FeedbackFeatureLink,
    'createdAt' | 'creatorId' | 'id'
  > & {
    feedback: Pick<Feedback, 'id' | 'title'>;
    feature: Pick<Feature, 'id' | 'title'>;
  })[];
  portalFeatures: (Pick<PortalFeature, 'createdAt' | 'creatorId' | 'id'> & {
    feature: Pick<Feature, 'id' | 'title'>;
  })[];
  releases: Pick<Release, 'createdAt' | 'creatorId' | 'id' | 'title'>[];
  members: {
    id: string;
    createdAt: Date;
    userImage: string | undefined;
    userName: string | undefined;
  }[];
  widgetItems: Pick<
    WidgetItem,
    'id' | 'name' | 'link' | 'creatorId' | 'createdAt'
  >[];
  date: Date;
};

export const getActivity = async (
  page: number
): Promise<
  | {
      data: GetActivityResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const organizationId = await currentOrganizationId();
    const date = subDays(new Date(), page);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    if (!organizationId) {
      throw new Error('Not logged in');
    }

    const [members, databaseOrganization] = await Promise.all([
      currentMembers(),
      database.organization.findUnique({
        where: {
          id: organizationId,
        },
        select: {
          initiatives: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              title: true,
              creatorId: true,
              createdAt: true,
            },
          },
          initiativeMembers: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              userId: true,
              createdAt: true,
              creatorId: true,
              initiative: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          initiativePages: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              title: true,
              creatorId: true,
              createdAt: true,
              initiative: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          initiativeCanvases: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              title: true,
              creatorId: true,
              createdAt: true,
              initiative: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          initiativeExternalLinks: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              title: true,
              creatorId: true,
              createdAt: true,
              href: true,
              initiative: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          feedback: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              title: true,
              source: true,
              createdAt: true,
              feedbackUser: {
                select: {
                  name: true,
                  imageUrl: true,
                  feedbackOrganization: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          products: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              name: true,
              creatorId: true,
              createdAt: true,
            },
          },
          groups: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              name: true,
              creatorId: true,
              createdAt: true,
            },
          },
          features: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              title: true,
              creatorId: true,
              createdAt: true,
              source: true,
            },
          },
          changelog: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              title: true,
              creatorId: true,
              createdAt: true,
            },
          },
          apiKeys: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              name: true,
              creatorId: true,
              createdAt: true,
            },
          },
          feedbackFeatureLinks: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              creatorId: true,
              createdAt: true,
              feedback: {
                select: {
                  title: true,
                  id: true,
                },
              },
              feature: {
                select: {
                  title: true,
                  id: true,
                },
              },
            },
          },
          portalFeatures: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              creatorId: true,
              createdAt: true,
              feature: {
                select: {
                  title: true,
                  id: true,
                },
              },
            },
          },
          widgetItems: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              name: true,
              link: true,
              creatorId: true,
              createdAt: true,
            },
          },
          releases: {
            take: 50,
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              id: true,
              title: true,
              creatorId: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    if (!databaseOrganization) {
      throw new Error('Organization not found');
    }

    const data = {
      date,
      ...databaseOrganization,
      members: members
        .filter(
          (member) =>
            new Date(member.created_at) >= startOfDay &&
            new Date(member.created_at) <= endOfDay
        )
        .map((member) => ({
          id: member.id,
          createdAt: new Date(member.created_at),
          userImage: member.user_metadata?.image,
          userName: getUserName(member),
        })),
    };

    return { data };
  } catch (error) {
    return { error };
  }
};
