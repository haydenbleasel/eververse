import { EmptyState } from '@/components/empty-state';
import { database } from '@/lib/database';
import { currentUser } from '@repo/backend/auth/utils';
import type { InitiativeUpdate } from '@repo/backend/prisma/client';
import { Link } from '@repo/design-system/components/link';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Separator } from '@repo/design-system/components/ui/separator';
import { colors } from '@repo/design-system/lib/colors';
import { formatDate } from '@repo/lib/format';
import { NewspaperIcon } from 'lucide-react';
import { CreateInitiativeUpdateButton } from './create-initiative-update-button';

const getColor = (
  update: Pick<
    InitiativeUpdate,
    'sendEmail' | 'sendSlack' | 'emailSentAt' | 'slackSentAt'
  >
) => {
  // Not sending to any channels
  if (!update.sendEmail && !update.sendSlack) {
    return colors.gray;
  }

  // If sending to both channels...
  if (update.sendEmail && update.sendSlack) {
    // If both have been sent
    if (update.emailSentAt && update.slackSentAt) {
      return colors.emerald;
    }
    // If one has been sent
    return colors.amber;
  }

  // If sending to email only
  if (update.emailSentAt) {
    if (update.sendEmail) {
      return colors.emerald;
    }
    return colors.amber;
  }

  // If sending to slack only
  if (update.slackSentAt && update.sendSlack) {
    if (update.sendSlack) {
      return colors.emerald;
    }
    return colors.amber;
  }

  // If not sending to any channels
  return colors.gray;
};

export const InitiativeUpdatesCard = async ({
  initiativeId,
}: { initiativeId: string }) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const initiative = await database.initiative.findUnique({
    where: { id: initiativeId },
    select: {
      ownerId: true,
      title: true,
      updates: {
        select: {
          id: true,
          title: true,
          sendEmail: true,
          sendSlack: true,
          emailSentAt: true,
          slackSentAt: true,
        },
      },
    },
  });

  if (!initiative) {
    return null;
  }

  if (!initiative.updates.length && user.id !== initiative.ownerId) {
    return (
      <StackCard title="Updates" icon={NewspaperIcon} className="not-prose p-8">
        <EmptyState
          title="No updates"
          description="No updates have been sent for this initiative yet."
        />
      </StackCard>
    );
  }

  if (!initiative.updates.length) {
    return (
      <StackCard title="Updates" icon={NewspaperIcon} className="not-prose p-8">
        <EmptyState
          title="Send your first update"
          description="Send an update to all members on the initiative."
        >
          <CreateInitiativeUpdateButton
            initiativeId={initiativeId}
            initiativeTitle={initiative.title}
          />
        </EmptyState>
      </StackCard>
    );
  }

  return (
    <StackCard
      title="Updates"
      icon={NewspaperIcon}
      className="max-h-[20rem] w-full overflow-y-auto p-2"
    >
      {initiative.updates.map((update) => (
        <Link
          key={update.id}
          href={`/initiatives/${initiativeId}/updates/${update.id}`}
          className="flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-card"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: getColor(update) }}
          />
          <span className="flex-1 truncate font-medium text-sm">
            {update.title}
          </span>
          {update.emailSentAt && (
            <span className="text-muted-foreground text-xs">
              Sent at {formatDate(update.emailSentAt)}
            </span>
          )}
        </Link>
      ))}
      <Separator className="my-2" />
      <CreateInitiativeUpdateButton
        initiativeId={initiativeId}
        initiativeTitle={initiative.title}
      />
    </StackCard>
  );
};
