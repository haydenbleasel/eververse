import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { Link } from '@repo/design-system/components/link';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import { TablePropertiesIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReleaseDatePicker } from './components/release-date-picker';
import { ReleaseFeature } from './components/release-feature';
import { ReleaseSettingsDropdown } from './components/release-settings-dropdown';
import { ReleaseStatePicker } from './components/release-state-picker';
import { ReleaseTitle } from './components/release-title';

type ReleasePageProps = {
  params: Promise<{
    release: string;
  }>;
};

export const metadata: Metadata = createMetadata({
  title: 'Release',
  description: 'View details about a release.',
});

const ReleasePage = async (props: ReleasePageProps) => {
  const params = await props.params;
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    return notFound();
  }

  const [release, members, organization] = await Promise.all([
    database.release.findUnique({
      where: {
        id: params.release,
      },
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
        state: true,
        features: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    }),
    currentMembers(),
    database.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        slug: true,
      },
    }),
  ]);

  if (!release || !organization) {
    return notFound();
  }

  return (
    <div className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <div className="flex items-start justify-between gap-3">
          <ReleaseTitle
            defaultTitle={release.title}
            releaseId={release.id}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
          />
          {user.user_metadata.organization_role !== EververseRole.Member && (
            <ReleaseSettingsDropdown releaseId={release.id} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <ReleaseStatePicker
              releaseId={release.id}
              defaultValue={release.state}
              disabled={
                user.user_metadata.organization_role === EververseRole.Member
              }
            />
          </div>
          <div>
            <ReleaseDatePicker
              releaseId={release.id}
              defaultStartAt={release.startAt}
              defaultEndAt={release.endAt}
              disabled={
                user.user_metadata.organization_role === EververseRole.Member
              }
            />
          </div>
        </div>
        {release.features.length ? (
          <StackCard
            title="Features"
            icon={TablePropertiesIcon}
            className="not-prose space-y-4"
          >
            {release.features.map((feature) => (
              <ReleaseFeature
                key={feature.id}
                id={feature.id}
                owner={members.find((member) => member.id === feature.ownerId)}
              />
            ))}
          </StackCard>
        ) : (
          <>
            <p>
              This release doesn't have any features yet! Head over to your
              feature backlog to assign some.
            </p>
            {user.user_metadata.organization_role !== EververseRole.Member && (
              <Button asChild variant="outline" className="w-fit">
                <Link href="/features" className="no-underline">
                  Browse features
                </Link>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReleasePage;
