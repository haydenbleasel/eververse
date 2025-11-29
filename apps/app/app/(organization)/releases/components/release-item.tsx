import type { Release } from "@repo/backend/prisma/client";
import { Link } from "@repo/design-system/components/link";
import { formatDate } from "@repo/lib/format";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { ReleaseStateDot } from "./release-state-dot";

type ReleaseItemProps = {
  release: Pick<
    Release,
    "id" | "title" | "startAt" | "endAt" | "state" | "jiraId"
  >;
};

export const ReleaseItem = ({ release }: ReleaseItemProps) => (
  <Link
    className="flex items-center gap-3 py-4"
    href={`/releases/${release.id}`}
    key={release.id}
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
    {release.jiraId && <Image alt="" height={16} src="/jira.svg" width={16} />}
    <ArrowRightIcon className="shrink-0 text-muted-foreground" size={16} />
  </Link>
);
