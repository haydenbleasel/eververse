'use client';

import type { User } from '@repo/backend/auth';
import { createClient } from '@repo/backend/auth/client';
import { getUserName } from '@repo/backend/auth/format';
import { Avatar } from '@repo/design-system/components/precomposed/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import { useEffect, useState } from 'react';

const ActivityAvatar = ({ user, online }: { user: User; online: boolean }) => (
  <div className="relative">
    <Avatar
      src={user.user_metadata.image_url}
      fallback={getUserName(user).slice(0, 2)}
    />
    <div
      className={cn(
        'absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background',
        online ? 'bg-success' : 'bg-muted-foreground'
      )}
    />
  </div>
);

export const Team = ({
  user,
  organizationId,
  members,
}: {
  user: User;
  organizationId: string;
  members: User[];
}) => {
  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    const initialize = async () => {
      const supabase = await createClient();
      const room = supabase.channel(organizationId, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      room
        .on('presence', { event: 'sync' }, () => {
          const newState = room.presenceState();
          const online = Object.keys(newState);

          setOnline(online);
        })
        .subscribe();

      room.track({
        user: user.id,
        online_at: new Date().toISOString(),
      });
    };

    initialize().catch(handleError);
  }, [organizationId, user.id]);

  const onlineMembers = online
    .map((id) => members.find((member) => member.id === id))
    .filter(Boolean) as User[];
  const offlineMembers = members.filter(
    (member) => !onlineMembers.includes(member)
  );

  const onlineMembersToShow = onlineMembers.slice(0, 4);
  const offlineMembersToShow =
    onlineMembersToShow.length === 4
      ? []
      : offlineMembers.slice(0, 4 - onlineMembersToShow.length);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="-space-x-1 flex cursor-pointer items-center justify-end">
          {onlineMembersToShow.map((onlineUser) => (
            <ActivityAvatar key={onlineUser.id} user={onlineUser} online />
          ))}
          {offlineMembersToShow.map((member) => (
            <ActivityAvatar key={member.id} user={member} online={false} />
          ))}
          {members.length > 5 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-background font-medium text-[10px] text-muted-foreground">
              +{members.length - 5}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        collisionPadding={8}
        className="flex max-h-[220px] flex-col gap-1.5 overflow-y-auto"
      >
        <p className="font-medium text-muted-foreground text-sm">Online</p>
        {onlineMembers.map((member) => (
          <div className="flex items-center gap-2" key={member.id}>
            <ActivityAvatar user={member} online />
            <p className="text-sm">{getUserName(member)}</p>
          </div>
        ))}
        {offlineMembers.length ? (
          <>
            <p className="mt-4 font-medium text-muted-foreground text-sm">
              Online
            </p>
            {offlineMembers.map((member) => (
              <div className="flex items-center gap-2" key={member.id}>
                <ActivityAvatar user={member} online={false} />
                <p className="text-sm">{getUserName(member)}</p>
              </div>
            ))}
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
