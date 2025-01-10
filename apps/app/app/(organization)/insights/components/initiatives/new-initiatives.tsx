import { database } from '@/lib/database';
import { currentMembers } from '@repo/backend/auth/utils';
import { Emoji } from '@repo/design-system/components/emoji';
import { StackCard } from '@repo/design-system/components/stack-card';
import { CompassIcon } from 'lucide-react';
import { InitiativePageCard } from './initiative-page-card';

export const NewInitiatives = async () => {
  const [initiatives, members] = await Promise.all([
    database.initiative.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        ownerId: true,
        emoji: true,
      },
    }),
    currentMembers(),
  ]);

  const getOwner = (userId: string) =>
    members.find((member) => member.id === userId);

  return (
    <StackCard className="p-0" title="New Initiatives" icon={CompassIcon}>
      <div className="flex flex-col gap-px p-1">
        {initiatives.map((initiative) => (
          <InitiativePageCard
            id={initiative.id}
            title={initiative.title}
            date={initiative.createdAt}
            icon={() => (
              <div className="flex h-4 w-4 items-center justify-center">
                <Emoji id={initiative.emoji} size="0.825rem" />
              </div>
            )}
            key={initiative.id}
            owner={getOwner(initiative.ownerId)}
          />
        ))}
      </div>
    </StackCard>
  );
};
