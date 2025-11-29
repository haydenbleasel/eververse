import { EververseRole } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import { currentMembers, currentUser } from "@repo/backend/auth/utils";
import type { Initiative } from "@repo/backend/prisma/client";
import { Emoji } from "@repo/design-system/components/emoji";
import { Link } from "@repo/design-system/components/link";
import { formatDate } from "@repo/lib/format";
import { FileIcon, FilePenIcon, FrameIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { AvatarTooltip } from "@/components/avatar-tooltip";
import * as SettingsBar from "@/components/settings-bar";
import { database } from "@/lib/database";
import { staticify } from "@/lib/staticify";
import { CreateInitiativeFileButton } from "./create-initiative-file-button";
import { CreateInitiativeLinkButton } from "./create-initiative-link-button";
import { CreateInitiativePageButton } from "./create-initiative-page-button";
import { DeleteExternalInitiativeLinkButton } from "./delete-external-initiative-link-button";
import { DeleteInitiativeFileButton } from "./delete-initiative-file-button";
import { InitiativeExternalLinkButton } from "./initiative-external-link-button";
import { InitiativeLinkDialog } from "./initiative-link-dialog";
import { InitiativeMemberPicker } from "./initiative-member-picker";
import { InitiativeOwnerPicker } from "./initiative-owner-picker";
import { InitiativeSettingsDropdown } from "./initiative-settings-dropdown";
import { InitiativeStatusPicker } from "./initiative-status-picker";

type InitiativeSidebarProperties = {
  readonly initiativeId: Initiative["id"];
};

export const InitiativeSidebar = async ({
  initiativeId,
}: InitiativeSidebarProperties) => {
  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const [initiative, features, groups, products, members] = await Promise.all([
    database.initiative.findUnique({
      where: { id: initiativeId },
      select: {
        id: true,
        createdAt: true,
        ownerId: true,
        state: true,
        pages: {
          select: {
            id: true,
            title: true,
            default: true,
          },
        },
        canvases: {
          select: {
            id: true,
            title: true,
          },
        },
        team: {
          select: {
            userId: true,
          },
        },
        externalLinks: {
          select: {
            id: true,
            href: true,
            title: true,
          },
        },
        files: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
    }),
    database.feature.findMany({
      select: {
        id: true,
        title: true,
        status: {
          select: {
            color: true,
          },
        },
        initiatives: { select: { id: true } },
      },
    }),
    database.group.findMany({
      select: {
        id: true,
        name: true,
        emoji: true,
        initiatives: { select: { id: true } },
      },
    }),
    database.product.findMany({
      select: {
        id: true,
        name: true,
        emoji: true,
        initiatives: { select: { id: true } },
      },
    }),
    currentMembers(),
  ]);

  if (!initiative) {
    notFound();
  }

  return (
    <SettingsBar.Root>
      {user.user_metadata.organization_role !== EververseRole.Member && (
        <InitiativeSettingsDropdown initiativeId={initiativeId} />
      )}
      <SettingsBar.Item title="Created">
        <p className="text-sm">{formatDate(initiative.createdAt)}</p>
      </SettingsBar.Item>

      <SettingsBar.Item title="Owner">
        <InitiativeOwnerPicker
          data={members}
          defaultValue={initiative.ownerId}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
          initiativeId={initiativeId}
        />
      </SettingsBar.Item>

      <SettingsBar.Item title="Status">
        <InitiativeStatusPicker
          defaultValue={initiative.state}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
          initiativeId={initiativeId}
        />
      </SettingsBar.Item>

      <SettingsBar.Item
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <InitiativeMemberPicker
              defaultMembers={initiative.team.map(({ userId }) => userId)}
              initiativeId={initiativeId}
              users={staticify(members)}
            />
          )
        }
        title="Team"
      >
        <div className="flex flex-wrap items-center gap-1">
          {initiative.team.map((member) => {
            const user = members.find((user) => user.id === member.userId);

            if (!user) {
              return null;
            }

            return (
              <AvatarTooltip
                fallback={getUserName(user).slice(0, 2)}
                key={member.userId}
                src={user.user_metadata.image_url}
                subtitle={user.email ?? ""}
                title={getUserName(user)}
              />
            );
          })}
        </div>
      </SettingsBar.Item>

      <SettingsBar.Item
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <CreateInitiativeLinkButton initiativeId={initiativeId} />
          )
        }
        title="Links"
      >
        <div className="flex flex-col gap-2">
          {initiative.externalLinks.map((link) => (
            <div
              className="flex items-center justify-between gap-4"
              key={link.id}
            >
              <InitiativeExternalLinkButton {...link} />
              {user.user_metadata.organization_role !==
                EververseRole.Member && (
                <DeleteExternalInitiativeLinkButton id={link.id} />
              )}
            </div>
          ))}
        </div>
      </SettingsBar.Item>

      <SettingsBar.Item
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <CreateInitiativePageButton initiativeId={initiativeId} />
          )
        }
        title="Pages"
      >
        <div className="flex flex-col gap-2">
          {initiative.pages
            .filter((page) => !page.default)
            .map((page) => (
              <Link
                className="group flex items-center gap-1.5 font-medium text-xs"
                href={`/initiatives/${initiativeId}/${page.id}`}
                key={page.id}
              >
                <FilePenIcon size={16} />
                <span className="w-full truncate group-hover:underline">
                  {page.title}
                </span>
              </Link>
            ))}
          {initiative.canvases.map((page) => (
            <Link
              className="group flex items-center gap-1.5 font-medium text-xs"
              href={`/initiatives/${initiativeId}/${page.id}`}
              key={page.id}
            >
              <FrameIcon size={16} />
              <span className="w-full truncate group-hover:underline">
                {page.title}
              </span>
            </Link>
          ))}
        </div>
      </SettingsBar.Item>

      <SettingsBar.Item
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <CreateInitiativeFileButton initiativeId={initiativeId} />
          )
        }
        title="Files"
      >
        <div className="flex flex-col gap-2">
          {initiative.files.map((file) => (
            <div
              className="flex items-center justify-between gap-4"
              key={file.id}
            >
              <Link
                className="group flex items-center gap-1.5 font-medium text-xs"
                href={file.url}
                key={file.id}
              >
                <FileIcon size={16} />
                <span className="w-full truncate group-hover:underline">
                  {file.name}
                </span>
              </Link>
              {user.user_metadata.organization_role !==
                EververseRole.Member && (
                <DeleteInitiativeFileButton id={file.id} />
              )}
            </div>
          ))}
        </div>
      </SettingsBar.Item>

      <SettingsBar.Item
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <InitiativeLinkDialog
              features={features.filter(
                (feature) =>
                  !feature.initiatives.some(
                    (initiative) => initiative.id === initiativeId
                  )
              )}
              groups={groups.filter(
                (group) =>
                  !group.initiatives.some(
                    (initiative) => initiative.id === initiativeId
                  )
              )}
              initiativeId={initiativeId}
              products={products.filter(
                (product) =>
                  !product.initiatives.some(
                    (initiative) => initiative.id === initiativeId
                  )
              )}
            />
          )
        }
        title="Connections"
      >
        <div className="flex flex-col gap-2">
          {features
            .filter((feature) =>
              feature.initiatives.some(
                (initiative) => initiative.id === initiativeId
              )
            )
            .map((feature) => (
              <Link
                className="group flex items-center gap-1.5 font-medium text-xs"
                href={`/features/${feature.id}`}
                key={feature.id}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: feature.status.color }}
                  />
                </span>
                <span className="w-full truncate group-hover:underline">
                  {feature.title}
                </span>
              </Link>
            ))}
          {groups
            .filter((group) =>
              group.initiatives.some(
                (initiative) => initiative.id === initiativeId
              )
            )
            .map((group) => (
              <Link
                className="group flex items-center gap-1.5 font-medium text-xs"
                href={`/features/groups/${group.id}`}
                key={group.id}
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  <Emoji id={group.emoji} size="0.825rem" />
                </div>
                <span className="w-full truncate group-hover:underline">
                  {group.name}
                </span>
              </Link>
            ))}
          {products
            .filter((product) =>
              product.initiatives.some(
                (initiative) => initiative.id === initiativeId
              )
            )
            .map((product) => (
              <Link
                className="group flex items-center gap-1.5 font-medium text-xs"
                href={`/features/products/${product.id}`}
                key={product.id}
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  <Emoji id={product.emoji} size="0.825rem" />
                </div>
                <span className="w-full truncate group-hover:underline">
                  {product.name}
                </span>
              </Link>
            ))}
        </div>
      </SettingsBar.Item>
    </SettingsBar.Root>
  );
};
