import { FeedbackItem } from '@/app/(organization)/feedback/components/feedback-item';
import * as SettingsBar from '@/components/settings-bar';
import { database } from '@/lib/database';
import { calculateRice } from '@/lib/rice';
import type { Feature } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { Button } from '@repo/design-system/components/ui/button';
import { contentToText } from '@repo/editor/lib/tiptap';
import { formatDate } from '@repo/lib/format';
import { SparklesIcon } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ConnectButton } from './connect-button';
import { DisconnectButton } from './disconnect-button';
import { FeatureClearDateButton } from './feature-clear-date-button';
import { FeatureClearReleaseButton } from './feature-clear-release-button';
import { FeatureDateRangePicker } from './feature-date-range-picker';
import { FeatureGroupPicker } from './feature-group-picker';
import { FeatureOwnerPicker } from './feature-owner-picker';
import { FeaturePageTabs } from './feature-page-tabs';
import { FeatureProductPicker } from './feature-product-picker';
import { FeatureReleasePicker } from './feature-release-picker';
import { FeatureRiceEditor } from './feature-rice-editor';
import { FeatureSettingsDropdown } from './feature-settings-dropdown';
import { FeatureStatusPicker } from './feature-status-picker';
import { PortalButton } from './portal-button';

type FeatureSidebarProperties = {
  readonly featureId: Feature['id'];
};

export const FeatureSidebar = async ({
  featureId,
}: FeatureSidebarProperties) => {
  const [user, organizationId, members] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
    currentMembers(),
  ]);

  if (!user || !organizationId) {
    notFound();
  }

  const databaseOrganization = await database.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      features: {
        where: {
          id: featureId,
        },
        select: {
          id: true,
          createdAt: true,
          ownerId: true,
          statusId: true,
          startAt: true,
          endAt: true,
          releaseId: true,
          product: {
            select: {
              id: true,
              groups: {
                select: {
                  id: true,
                  name: true,
                  emoji: true,
                },
              },
            },
          },
          group: {
            select: {
              id: true,
            },
          },
          portalFeature: {
            select: {
              id: true,
            },
          },
          rice: {
            select: {
              reach: true,
              impact: true,
              confidence: true,
              effort: true,
            },
          },
          aiRice: {
            select: {
              reach: true,
              impact: true,
              confidence: true,
              effort: true,
              reachReason: true,
              impactReason: true,
              confidenceReason: true,
              effortReason: true,
            },
          },
          connection: {
            select: {
              id: true,
              href: true,
              githubInstallationId: true,
              atlassianInstallationId: true,
              linearInstallationId: true,
            },
          },
          feedback: {
            select: {
              feedback: {
                select: {
                  id: true,
                  title: true,
                  createdAt: true,
                  feedbackUser: {
                    select: {
                      name: true,
                      email: true,
                      imageUrl: true,
                    },
                  },
                  aiSentiment: true,
                },
              },
            },
          },
          customFields: {
            select: {
              id: true,
              value: true,
              customField: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      featureStatuses: {
        select: { id: true, name: true, color: true },
        orderBy: { order: 'asc' },
      },
      products: {
        select: {
          id: true,
          name: true,
          emoji: true,
          groups: {
            select: {
              id: true,
              name: true,
              emoji: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      },
      releases: {
        select: { id: true, title: true },
        orderBy: { title: 'asc' },
      },
      templates: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const feature = databaseOrganization?.features.at(0);

  if (!databaseOrganization || !feature) {
    notFound();
  }

  const riceScore = feature.rice ? calculateRice(feature.rice) : null;
  const aiRiceScore = feature.aiRice ? calculateRice(feature.aiRice) : null;

  let riceScoreCaption: ReactNode | undefined;

  if (riceScore) {
    riceScoreCaption = (
      <span className="text-muted-foreground text-sm">
        {riceScore.toString()}
      </span>
    );
  } else if (aiRiceScore) {
    riceScoreCaption = (
      <div className="flex items-center gap-1 text-primary text-sm">
        <SparklesIcon size={16} />
        <span>{aiRiceScore.toString()}</span>
      </div>
    );
  }

  let featureConnectionSource = '';

  if (feature.connection?.githubInstallationId) {
    featureConnectionSource = '/github.svg';
  } else if (feature.connection?.atlassianInstallationId) {
    featureConnectionSource = '/jira.svg';
  } else if (feature.connection?.linearInstallationId) {
    featureConnectionSource = '/linear.svg';
  }

  const promises = feature.feedback.map(async (feedbackItem) => {
    const content = await getJsonColumnFromTable(
      'feedback',
      'content',
      feedbackItem.feedback.id
    );

    return {
      ...feedbackItem.feedback,
      text: contentToText(content),
    };
  });

  const modifiedFeedback = await Promise.all(promises);

  return (
    <SettingsBar.Root>
      {user.user_metadata.organization_role !== EververseRole.Member && (
        <FeatureSettingsDropdown
          featureId={feature.id}
          templates={databaseOrganization.templates}
        />
      )}

      <SettingsBar.Item title="Created">
        <p className="text-sm">{formatDate(feature.createdAt)}</p>
      </SettingsBar.Item>

      <SettingsBar.Item title="Switch View">
        <FeaturePageTabs id={feature.id} />
      </SettingsBar.Item>

      <SettingsBar.Item title="Owner">
        <FeatureOwnerPicker
          featureId={feature.id}
          defaultValue={feature.ownerId}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
          data={members}
        />
      </SettingsBar.Item>

      <SettingsBar.Item title="Product">
        <FeatureProductPicker
          featureId={feature.id}
          defaultValue={feature.product?.id}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
          data={databaseOrganization.products}
        />
      </SettingsBar.Item>

      {feature.product?.groups && (
        <SettingsBar.Item title="Group">
          <FeatureGroupPicker
            featureId={feature.id}
            defaultValue={feature.group?.id}
            disabled={
              user.user_metadata.organization_role === EververseRole.Member ||
              !feature.product.groups.length
            }
            data={feature.product.groups}
          />
        </SettingsBar.Item>
      )}

      <SettingsBar.Item title="Status">
        <FeatureStatusPicker
          featureId={feature.id}
          defaultValue={feature.statusId}
          statuses={databaseOrganization.featureStatuses}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
        />
      </SettingsBar.Item>

      <SettingsBar.Item
        title="Release"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <FeatureClearReleaseButton featureId={feature.id} />
          )
        }
      >
        <FeatureReleasePicker
          featureId={feature.id}
          defaultValue={feature.releaseId}
          releases={databaseOrganization.releases}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
        />
      </SettingsBar.Item>

      <SettingsBar.Item
        title="Date"
        action={
          user.user_metadata.organization_role !== EververseRole.Member && (
            <FeatureClearDateButton featureId={feature.id} />
          )
        }
      >
        <FeatureDateRangePicker
          featureId={feature.id}
          defaultStartAt={feature.startAt}
          defaultEndAt={feature.endAt}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
        />
      </SettingsBar.Item>

      <SettingsBar.Item title="RICE Score" action={riceScoreCaption}>
        <FeatureRiceEditor
          featureId={feature.id}
          rice={feature.rice}
          aiRice={feature.aiRice}
          disabled={
            user.user_metadata.organization_role === EververseRole.Member
          }
        />
      </SettingsBar.Item>

      <SettingsBar.Item title="Synced Issue">
        {feature.connection ? (
          <>
            <Button asChild variant="outline">
              <a
                href={feature.connection.href}
                target="_blank"
                rel="noreferrer"
                aria-label="Connection"
                className="flex items-center gap-2"
              >
                {featureConnectionSource && (
                  <Image
                    src={featureConnectionSource}
                    width={16}
                    height={16}
                    alt=""
                  />
                )}
                <span>View connected feature</span>
              </a>
            </Button>
            {!feature.connection.githubInstallationId &&
            !feature.connection.atlassianInstallationId &&
            !feature.connection.linearInstallationId ? (
              <p className="mt-1 text-center text-muted-foreground text-sm">
                Syncing disabled
              </p>
            ) : (
              <DisconnectButton connectionId={feature.connection.id} />
            )}
          </>
        ) : (
          <div className="flex flex-col">
            {user.user_metadata.organization_role ===
            EververseRole.Member ? null : (
              <ConnectButton featureId={feature.id} />
            )}
          </div>
        )}
      </SettingsBar.Item>

      <SettingsBar.Item title="Portal">
        <PortalButton
          featureId={feature.id}
          portalFeatureId={feature.portalFeature?.id}
        />
      </SettingsBar.Item>

      {modifiedFeedback.length > 0 ? (
        <SettingsBar.Item title="Linked Feedback">
          <>
            {modifiedFeedback.map((feedback) => (
              <div className="overflow-hidden rounded-md" key={feedback.id}>
                <FeedbackItem feedback={feedback} />
              </div>
            ))}
          </>
        </SettingsBar.Item>
      ) : null}

      {feature.customFields.length > 0 ? (
        <SettingsBar.Item title="Custom Fields">
          <>
            {feature.customFields.map((field) => (
              <div key={field.id} className="flex items-center gap-2 text-sm">
                <p className="truncate text-muted-foreground">
                  {field.customField.name}
                </p>
                <p className="truncate font-medium">{field.value}</p>
              </div>
            ))}
          </>
        </SettingsBar.Item>
      ) : null}
    </SettingsBar.Root>
  );
};
