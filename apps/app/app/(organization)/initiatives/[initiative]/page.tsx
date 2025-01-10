import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { textToContent } from '@repo/editor/lib/tiptap';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSONContent } from 'novel';
import { Suspense } from 'react';
import { CreateInitiativeUpdateButton } from './components/create-initiative-update-button';
import { InitiativeEmoji } from './components/initiative-emoji';
import { InitiativeFeatures } from './components/initiative-features';
import { InitiativePageEditor } from './components/initiative-page-editor';
import { InitiativeQuestionCard } from './components/initiative-question-card';
import { InitiativeSidebar } from './components/initiative-sidebar';
import { InitiativeTitle } from './components/initiative-title';
import { InitiativeUpdatesCard } from './components/initiative-updates-card';

type InitiativeProperties = {
  readonly params: Promise<{
    readonly initiative: string;
  }>;
};

export const generateMetadata = async (
  props: InitiativeProperties
): Promise<Metadata> => {
  const params = await props.params;
  const initiative = await database.initiative.findUnique({
    where: { id: params.initiative },
  });

  if (!initiative) {
    return {};
  }

  return createMetadata({
    title: initiative.title,
    description: 'Create and edit content for your initiative.',
  });
};

const Initiative = async (props: InitiativeProperties) => {
  const params = await props.params;
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    notFound();
  }

  const organization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      stripeSubscriptionId: true,
      features: {
        select: {
          id: true,
          title: true,
          status: {
            select: {
              color: true,
            },
          },
        },
        where: {
          initiatives: {
            none: {
              id: params.initiative,
            },
          },
        },
      },
      groups: {
        where: {
          initiatives: {
            none: {
              id: params.initiative,
            },
          },
        },
        select: {
          id: true,
          name: true,
          emoji: true,
        },
      },
      products: {
        where: {
          initiatives: {
            none: {
              id: params.initiative,
            },
          },
        },
        select: {
          id: true,
          name: true,
          emoji: true,
        },
      },
      initiatives: {
        where: {
          id: params.initiative,
        },
        select: {
          title: true,
          emoji: true,
          pages: {
            where: {
              default: true,
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  const initiative = organization?.initiatives.at(0);

  if (!organization || !initiative) {
    notFound();
  }

  let page = initiative?.pages.at(0);

  if (!page) {
    page = await database.initiativePage.create({
      data: {
        initiativeId: params.initiative,
        organizationId,
        default: true,
        creatorId: user.id,
        title: initiative.title,
      },
      select: {
        id: true,
      },
    });
  }

  let content = await getJsonColumnFromTable(
    'initiative_page',
    'content',
    page.id
  );

  if (!content) {
    const newContent = textToContent('');

    await database.initiativePage.update({
      where: { id: page.id },
      data: {
        content: newContent,
      },
      select: {
        id: true,
      },
    });

    content = newContent;
  }

  return (
    <div className="flex items-start">
      <div className="flex-1 px-6 py-16">
        <div className="mx-auto grid max-w-prose gap-6">
          <div className="flex items-center justify-between gap-2">
            <InitiativeEmoji
              initiativeId={params.initiative}
              defaultEmoji={initiative.emoji}
              editable={
                user.user_metadata.organization_role !== EververseRole.Member
              }
            />
            <CreateInitiativeUpdateButton
              initiativeId={params.initiative}
              initiativeTitle={initiative.title}
            />
          </div>
          <InitiativeTitle
            initiativeId={params.initiative}
            defaultTitle={initiative.title}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
          />
          {organization.stripeSubscriptionId && (
            <InitiativeQuestionCard
              initiativeId={params.initiative}
              organizationId={organizationId}
            />
          )}
          <InitiativePageEditor
            pageId={page.id}
            defaultValue={content as JSONContent}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
            subscribed={Boolean(organization.stripeSubscriptionId)}
          />
          <Suspense fallback={<Skeleton className="h-[366px] w-full" />}>
            <InitiativeUpdatesCard initiativeId={params.initiative} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[366px] w-full" />}>
            <InitiativeFeatures initiativeId={params.initiative} />
          </Suspense>
        </div>
      </div>
      <InitiativeSidebar initiativeId={params.initiative} />
    </div>
  );
};

export default Initiative;
