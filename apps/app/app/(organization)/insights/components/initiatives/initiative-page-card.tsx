import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import { Link } from '@repo/design-system/components/link';
import { Avatar } from '@repo/design-system/components/precomposed/avatar';
import { formatDate } from '@repo/lib/format';
import type { FC } from 'react';

type InitiativePageCardProps = {
  id: string;
  title: string;
  date: Date;
  icon: FC;
  owner: User | undefined;
};

export const InitiativePageCard = ({
  id,
  title,
  date,
  icon: Icon,
  owner,
}: InitiativePageCardProps) => {
  const name = owner ? getUserName(owner) : undefined;

  return (
    <Link
      href={`/initiatives/${id}`}
      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-card"
      key={id}
    >
      <Icon />
      <p className="flex-1 truncate font-medium">{title}</p>
      <p className="shrink-0 text-muted-foreground">{formatDate(date)}</p>
      <Avatar src={owner?.user_metadata.image_url} fallback={name} />
    </Link>
  );
};
