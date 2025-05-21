import { AvatarTooltip } from '@/components/avatar-tooltip';
import * as SettingsBar from '@/components/settings-bar';

import { database } from '@/lib/database';
import { staticify } from '@/lib/staticify';
import { EververseRole } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import { currentMembers, currentUser } from '@repo/backend/auth/utils';
import type { Initiative } from '@repo/backend/prisma/client';
import { Emoji } from '@repo/design-system/components/emoji';
import { Link } from '@repo/design-system/components/link';
import { formatDate } from '@repo/lib/format';
import { FileIcon, FilePenIcon, FrameIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { CreateInitiativeFileButton } from './create-initiative-file-button';
import { CreateInitiativeLinkButton } from './create-initiative-link-button';
import { CreateInitiativePageButton } from './create-initiative-page-button';
import { DeleteExternalInitiativeLinkButton } from './delete-external-initiative-link-button';
import { DeleteInitiativeFileButton } from './delete-initiative-file-button';
import { InitiativeExternalLinkButton } from './initiative-external-link-button';
import { InitiativeLinkDialog } from './initiative-link-dialog';
import { InitiativeMemberPicker } from './initiative-member-picker';
import { InitiativeOwnerPicker } from './initiative-owner-picker';
import { InitiativeSettingsDropdown } from './initiative-settings-dropdown';
import { InitiativeStatusPicker } from './initiative-status-picker';

type InitiativeSidebarProperties = {
  readonly initiativeId: Initiative['id'];
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
          defaultValue={initiative.ownerId}
          initiativeId={initiativeId}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
          data={members}
        />
      </SettingsBar.Item>

      <SettingsBar.Item title="Status">
        <InitiativeStatusPicker
          defaultValue={initiative.state}
          initiativeId={initiativeId}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
        />
      </SettingsBar.Item>

      <SettingsBar.Item
        title="Team"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <InitiativeMemberPicker
              defaultMembers={initiative.team.map(({ userId }) => userId)}
              initiativeId={initiativeId}
              users={staticify(members)}
            />
          )
        }
      >
        <div className="flex flex-wrap items-center gap-1">
          {initiative.team.map((member) => {
            const user = members.find((user) => user.id === member.userId);

            if (!user) {
              return null;
            }

            return (
              <AvatarTooltip
                key={member.userId}
                fallback={getUserName(user).slice(0, 2)}
                subtitle={user.email ?? ''}
                title={getUserName(user)}
                src={user.user_metadata.image_url}
              />
            );
          })}
        </div>
      </SettingsBar.Item>

      <SettingsBar.Item
        title="Links"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <CreateInitiativeLinkButton initiativeId={initiativeId} />
          )
        }
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
        title="Pages"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <CreateInitiativePageButton initiativeId={initiativeId} />
          )
        }
      >
        <div className="flex flex-col gap-2">
          {initiative.pages
            .filter((page) => !page.default)
            .map((page) => (
              <Link
                key={page.id}
                href={`/initiatives/${initiativeId}/${page.id}`}
                className="group flex items-center gap-1.5 font-medium text-xs"
              >
                <FilePenIcon size={16} />
                <span className="w-full truncate group-hover:underline">
                  {page.title}
                </span>
              </Link>
            ))}
          {initiative.canvases.map((page) => (
            <Link
              key={page.id}
              href={`/initiatives/${initiativeId}/${page.id}`}
              className="group flex items-center gap-1.5 font-medium text-xs"
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
        title="Files"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <CreateInitiativeFileButton initiativeId={initiativeId} />
          )
        }
      >
        <div className="flex flex-col gap-2">
          {initiative.files.map((file) => (
            <div
              className="flex items-center justify-between gap-4"
              key={file.id}
            >
              <Link
                key={file.id}
                href={file.url}
                className="group flex items-center gap-1.5 font-medium text-xs"
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
        title="Connections"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <InitiativeLinkDialog
              initiativeId={initiativeId}
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
              products={products.filter(
                (product) =>
                  !product.initiatives.some(
                    (initiative) => initiative.id === initiativeId
                  )
              )}
            />
          )
        }
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
                href={`/features/${feature.id}`}
                key={feature.id}
                className="group flex items-center gap-1.5 font-medium text-xs"
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
                href={`/features/groups/${group.id}`}
                key={group.id}
                className="group flex items-center gap-1.5 font-medium text-xs"
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
                href={`/features/products/${product.id}`}
                key={product.id}
                className="group flex items-center gap-1.5 font-medium text-xs"
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
