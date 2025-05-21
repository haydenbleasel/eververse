import type { Release } from '@repo/backend/prisma/client';
import { Link } from '@repo/design-system/components/link';
import { formatDate } from '@repo/lib/format';
import { ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';
import { ReleaseStateDot } from './release-state-dot';

type ReleaseItemProps = {
  release: Pick<
    Release,
    'id' | 'title' | 'startAt' | 'endAt' | 'state' | 'jiraId'
  >;
};

export const ReleaseItem = ({ release }: ReleaseItemProps) => {
  return (
    <Link
      href={`/releases/${release.id}`}
      key={release.id}
      className="flex items-center gap-3 py-4"
    >
      <ReleaseStateDot state={release.state} />
      <h2 className="m-0 flex-1 truncate font-semibold">{release.title}</h2>
      <div className="flex shrink-0 items-center gap-1 text-muted-foreground text-sm">
        {release.startAt && !release.endAt && <span>Starts</span>}
        {release.startAt && <span>{formatDate(release.startAt)}</span>}
        {release.startAt && release.endAt && <span>to</span>}
        {release.endAt && !release.startAt && <span>Ends</span>}
        {release.endAt && <span>{formatDate(release.endAt)}</span>}
      </div>
      {release.jiraId && (
        <Image src="/jira.svg" width={16} height={16} alt="" />
      )}
      <ArrowRightIcon size={16} className="shrink-0 text-muted-foreground" />
    </Link>
  );
};
