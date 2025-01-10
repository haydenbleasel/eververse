import { AvatarTooltip } from '@/components/avatar-tooltip';
import * as SettingsBar from '@/components/settings-bar';
import { database } from '@/lib/database';
import { staticify } from '@/lib/staticify';
import type { Changelog } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import { currentMembers, currentUser } from '@repo/backend/auth/utils';
import { Badge } from '@repo/design-system/components/ui/badge';
import { formatDate } from '@repo/lib/format';
import { notFound } from 'next/navigation';
import { ChangelogContributorsPicker } from './changelog-contributors-picker';
import { ChangelogDatePicker } from './changelog-date-picker';
import { ChangelogSettingsDropdown } from './changelog-settings-dropdown';
import { ChangelogSlugInput } from './changelog-slug-input';
import { ChangelogStatusPicker } from './changelog-status-picker';
import { ChangelogTagsPicker } from './changelog-tags-picker';

type ChangelogSidebarProperties = {
  readonly changelogId: Changelog['id'];
};

export const ChangelogSidebar = async ({
  changelogId,
}: ChangelogSidebarProperties) => {
  const [user, changelog, members, changelogTags] = await Promise.all([
    currentUser(),
    database.changelog.findUnique({
      where: { id: changelogId },
      select: {
        id: true,
        createdAt: true,
        publishAt: true,
        slug: true,
        contributors: {
          select: { userId: true },
        },
        status: true,
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    currentMembers(),
    database.changelogTag.findMany(),
  ]);

  if (!user || !changelog) {
    notFound();
  }

  return (
    <SettingsBar.Root>
      {user.user_metadata.organization_role !== EververseRole.Member && (
        <ChangelogSettingsDropdown changelogId={changelogId} />
      )}

      <SettingsBar.Item title="Created">
        <p className="text-sm">{formatDate(changelog.createdAt)}</p>
      </SettingsBar.Item>

      <SettingsBar.Item title="Publish Date">
        <ChangelogDatePicker
          changelogId={changelog.id}
          defaultPublishAt={changelog.publishAt}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
        />
      </SettingsBar.Item>

      <SettingsBar.Item
        title="Contributors"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <ChangelogContributorsPicker
              changelogId={changelog.id}
              users={staticify(members)}
              defaultContributors={changelog.contributors.map(
                ({ userId }) => userId
              )}
            />
          )
        }
      >
        <div className="flex flex-wrap items-center gap-1">
          {changelog.contributors.map((contributor) => {
            const user = members.find((user) => user.id === contributor.userId);

            if (!user) {
              return null;
            }

            return (
              <AvatarTooltip
                key={contributor.userId}
                fallback={getUserName(user).slice(0, 2)}
                subtitle={user.email ?? ''}
                title={getUserName(user)}
                src={user.user_metadata?.image_url}
              />
            );
          })}
        </div>
      </SettingsBar.Item>

      <SettingsBar.Item title="Status">
        <ChangelogStatusPicker
          changelogId={changelog.id}
          defaultValue={changelog.status}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
        />
      </SettingsBar.Item>

      <SettingsBar.Item title="Slug">
        <ChangelogSlugInput
          changelogId={changelog.id}
          defaultValue={changelog.slug}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
        />
      </SettingsBar.Item>

      <SettingsBar.Item
        title="Tags"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <ChangelogTagsPicker
              changelogId={changelog.id}
              defaultTags={changelog.tags.map(({ id }) => id)}
              storedTags={changelogTags}
            />
          )
        }
      >
        <div className="flex flex-wrap items-center gap-1">
          {changelog.tags.map((tag) => (
            <Badge variant="outline" key={tag.id}>
              {tag.name}
            </Badge>
          ))}
        </div>
      </SettingsBar.Item>
    </SettingsBar.Root>
  );
};
