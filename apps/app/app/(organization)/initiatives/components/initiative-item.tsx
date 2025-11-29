import type { User } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import { getJsonColumnFromTable } from "@repo/backend/database";
import type {
  Initiative,
  InitiativeMember,
  InitiativePage,
} from "@repo/backend/prisma/client";
import { Emoji } from "@repo/design-system/components/emoji";
import { Link } from "@repo/design-system/components/link";
import { colors } from "@repo/design-system/lib/colors";
import { cn } from "@repo/design-system/lib/utils";
import { contentToText } from "@repo/editor/lib/tiptap";
import { ArrowRightIcon } from "lucide-react";
import { AvatarTooltip } from "@/components/avatar-tooltip";

type InitiativeItemProps = {
  initiative: Pick<Initiative, "id" | "emoji" | "title" | "state"> & {
    team: Pick<InitiativeMember, "userId">[];
    pages: Pick<InitiativePage, "id">[];
  };
  members: User[];
};

const getBackgroundColor = (state: Initiative["state"]) => {
  if (state === "COMPLETED") {
    return colors.emerald;
  }

  if (state === "ACTIVE") {
    return colors.amber;
  }

  if (state === "CANCELLED") {
    return colors.rose;
  }

  return colors.gray;
};

export const InitiativeItem = async ({
  initiative,
  members,
}: InitiativeItemProps) => {
  const content = initiative.pages.length
    ? await getJsonColumnFromTable(
        "initiative_page",
        "content",
        initiative.pages[0].id
      )
    : null;
  const description = content ? contentToText(content) : null;

  return (
    <Link
      className={cn(
        "flex items-center justify-between gap-8 py-4",
        initiative.state === "COMPLETED" && "opacity-50",
        initiative.state === "CANCELLED" && "opacity-50"
      )}
      href={`/initiatives/${initiative.id}`}
      key={initiative.id}
    >
      <span className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
          <Emoji id={initiative.emoji} size="1.25rem" />
          <div
            className="-bottom-1 -right-1 absolute h-3 w-3 rounded-full border-2 border-background ring-1 ring-border"
            style={{
              backgroundColor: getBackgroundColor(initiative.state),
            }}
          />
        </div>
        <span>
          <h2 className="m-0 truncate font-semibold">{initiative.title}</h2>
          <p className="m-0 truncate text-muted-foreground text-sm">
            {description}
          </p>
        </span>
      </span>
      <div className="flex shrink-0 items-center justify-end gap-4">
        <div className="-space-x-1 flex items-center hover:space-x-1">
          {members.map((member) => (
            <div className="shrink-0 transition-all" key={member.id}>
              <AvatarTooltip
                fallback={getUserName(member).slice(0, 2)}
                src={member.user_metadata.image_url}
                subtitle={member.email ?? "Unknown"}
                title={getUserName(member)}
              />
            </div>
          ))}
        </div>
        <ArrowRightIcon className="shrink-0 text-muted-foreground" size={16} />
      </div>
    </Link>
  );
};
