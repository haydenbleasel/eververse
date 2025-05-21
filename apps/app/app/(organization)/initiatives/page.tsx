import { EmptyState } from '@/components/empty-state';
import { database } from '@/lib/database';
import emojiData from '@emoji-mart/data';
import { EververseRole } from '@repo/backend/auth';
import { currentMembers, currentUser } from '@repo/backend/auth/utils';
import { createMetadata } from '@repo/seo/metadata';
import { init } from 'emoji-mart';
import { CompassIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CreateInitiativeButton } from './components/create-initiative-button';
import { InitiativeItem } from './components/initiative-item';
import { InitiativesEmptyState } from './components/initiatives-empty-state';

init({ data: emojiData });

const title = 'Initiatives';
const description = 'Create and manage initiatives for your product.';

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Initiatives = async () => {
  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const [initiatives, members] = await Promise.all([
    database.initiative.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        emoji: true,
        state: true,
        team: {
          select: {
            userId: true,
          },
        },
        pages: {
          where: { default: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
          },
        },
      },
    }),
    currentMembers(),
  ]);

  if (
    initiatives.length === 0 &&
    user.user_metadata.organization_role === EververseRole.Member
  ) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EmptyState
          title="You don't have any initiatives"
          description="Initiatives are a way to organize your product development efforts."
          icon={CompassIcon}
        />
      </div>
    );
  }

  if (initiatives.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <InitiativesEmptyState />
      </div>
    );
  }

  return (
    <div className="px-6 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-2">
            <h1 className="m-0 font-semibold text-4xl">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {user.user_metadata.organization_role !== EververseRole.Member && (
            <CreateInitiativeButton />
          )}
        </div>
        <div className="mt-8 divide-y">
          {initiatives
            .sort((initiativeA, initiativeB) => {
              const stateOrder = [
                'ACTIVE',
                'PLANNED',
                'COMPLETED',
                'CANCELLED',
              ];
              const stateA = stateOrder.indexOf(initiativeA.state);
              const stateB = stateOrder.indexOf(initiativeB.state);

              if (stateA !== stateB) {
                return stateA - stateB;
              }

              // If states are the same, sort by title
              return initiativeA.title.localeCompare(initiativeB.title);
            })
            .map((initiative) => (
              <InitiativeItem
                key={initiative.id}
                initiative={initiative}
                members={members.filter((member) =>
                  initiative.team.some((team) => team.userId === member.id)
                )}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Initiatives;
